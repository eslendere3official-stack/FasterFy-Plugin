<?php
/**
 * Worker de procesamiento en segundo plano.
 *
 * Encadena el procesamiento de la cola mediante peticiones "loopback" no
 * bloqueantes: el servidor se llama a sí mismo (a un endpoint REST propio,
 * autenticado por token) para procesar un lote y, si quedan pendientes,
 * dispara la siguiente petición. Así el trabajo continúa aunque el usuario
 * cierre la pestaña, SIN depender de WP-Cron ni de Action Scheduler.
 *
 * Un "watchdog" por WP-Cron reanuda la cadena si ésta se cortó (p. ej. el
 * host mató la petición loopback), garantizando auto-sanación.
 *
 * @package FasterFy
 */

declare( strict_types=1 );

namespace FasterFy\Queue;

use FasterFy\Contracts\Bootable;
use FasterFy\Logger;
use FasterFy\Settings;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Orquesta la continuación del procesamiento en segundo plano.
 */
final class BackgroundWorker implements Bootable {

	public const WATCH_HOOK   = 'fasterfy_worker_watch';
	public const RESUME_HOOK  = 'fasterfy_worker_resume';
	public const TOKEN_OPTION = 'fasterfy_worker_token';
	public const SCHEDULE     = 'fasterfy_minute';

	private QueueManager $queue;
	private Settings $settings;
	private Logger $logger;

	/**
	 * Constructor.
	 *
	 * @param QueueManager $queue    Cola.
	 * @param Settings     $settings Ajustes.
	 * @param Logger       $logger   Logger.
	 */
	public function __construct( QueueManager $queue, Settings $settings, Logger $logger ) {
		$this->queue    = $queue;
		$this->settings = $settings;
		$this->logger   = $logger;
	}

	/**
	 * {@inheritDoc}
	 */
	public function register_hooks(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
		add_filter( 'cron_schedules', [ $this, 'add_schedule' ] );
		add_action( self::WATCH_HOOK, [ $this, 'watchdog' ] );
		add_action( self::RESUME_HOOK, [ $this, 'work' ] );

		// Programa el vigilante (cada minuto) para reanudar cadenas caídas.
		if ( ! wp_next_scheduled( self::WATCH_HOOK ) ) {
			wp_schedule_event( time() + 60, self::SCHEDULE, self::WATCH_HOOK );
		}
	}

	/**
	 * Añade una recurrencia de cron "cada minuto".
	 *
	 * @param array<string, array{interval:int, display:string}> $schedules Recurrencias.
	 * @return array<string, array{interval:int, display:string}>
	 */
	public function add_schedule( array $schedules ): array {
		if ( ! isset( $schedules[ self::SCHEDULE ] ) ) {
			$schedules[ self::SCHEDULE ] = [
				'interval' => 60,
				'display'  => __( 'Cada minuto (FasterFy)', 'fasterfy' ),
			];
		}
		return $schedules;
	}

	/**
	 * Registra el endpoint REST del worker (autenticado por token, no por
	 * sesión de usuario, ya que lo invoca el propio servidor).
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			'fasterfy/v1',
			'/worker',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'handle_request' ],
				'permission_callback' => [ $this, 'authorize' ],
			]
		);
	}

	/**
	 * Autoriza la petición del worker comparando el token secreto.
	 *
	 * @param WP_REST_Request $request Petición.
	 * @return bool
	 */
	public function authorize( WP_REST_Request $request ): bool {
		$provided = (string) $request->get_param( 'token' );
		$stored   = (string) get_option( self::TOKEN_OPTION, '' );
		return '' !== $stored && '' !== $provided && hash_equals( $stored, $provided );
	}

	/**
	 * Maneja la petición loopback: procesa y continúa.
	 *
	 * @param WP_REST_Request $request Petición.
	 * @return WP_REST_Response
	 */
	public function handle_request( WP_REST_Request $request ): WP_REST_Response {
		// No cerrar la conexión antes de trabajar; el llamador es no bloqueante.
		$this->work();
		return new WP_REST_Response( [ 'ok' => true ], 200 );
	}

	/**
	 * Procesa UN lote y decide cómo continuar la cadena.
	 *
	 * @return void
	 */
	public function work(): void {
		$state = $this->queue->get_state();
		if ( 'running' !== ( $state['status'] ?? 'idle' ) ) {
			return;
		}

		// Evita que el host mate el proceso por tiempo; cada petición hace un
		// solo lote (run_batch ya tiene su propio presupuesto interno) y luego
		// encadena una petición nueva.
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 60 ); // phpcs:ignore
		}
		if ( function_exists( 'ignore_user_abort' ) ) {
			@ignore_user_abort( true ); // phpcs:ignore
		}

		$state = $this->queue->run_batch();

		if ( 'running' !== ( $state['status'] ?? 'idle' ) ) {
			return; // Completado, pausado o sin cuota: la cadena termina.
		}

		$retry = (int) ( $state['retry_after'] ?? 0 );
		if ( $retry > 0 ) {
			// El proveedor pidió esperar: reanuda tras el retraso (best-effort
			// vía cron; el watchdog también cubre este caso).
			wp_schedule_single_event( time() + min( 120, max( 5, $retry ) ), self::RESUME_HOOK );
			return;
		}

		// Continúa de inmediato con una nueva petición loopback.
		$this->dispatch();
	}

	/**
	 * Dispara una petición loopback no bloqueante al endpoint del worker.
	 * Debe llamarse al iniciar/reanudar la cola.
	 *
	 * @return void
	 */
	public function dispatch(): void {
		$token = (string) get_option( self::TOKEN_OPTION, '' );
		if ( '' === $token ) {
			$token = wp_generate_password( 48, false, false );
			update_option( self::TOKEN_OPTION, $token, false );
		}

		$url = rest_url( 'fasterfy/v1/worker' );

		wp_remote_post(
			$url,
			[
				'timeout'   => 0.01,   // No esperamos respuesta (fire-and-forget).
				'blocking'  => false,
				'sslverify' => false,  // Loopback puede usar certificado local.
				'body'      => [ 'token' => $token ],
				'cookies'   => [],
			]
		);
	}

	/**
	 * Vigilante periódico: si la cola sigue "running" pero lleva demasiado
	 * tiempo sin actividad, la cadena loopback probablemente murió; la reanuda.
	 *
	 * @return void
	 */
	public function watchdog(): void {
		$state = $this->queue->get_state();
		if ( 'running' !== ( $state['status'] ?? 'idle' ) ) {
			return;
		}

		$updated = isset( $state['updated_at'] ) ? strtotime( (string) $state['updated_at'] . ' UTC' ) : 0;
		if ( ! $updated || ( time() - $updated ) > 120 ) {
			$this->logger->info( __( 'Reanudando procesamiento en segundo plano (watchdog).', 'fasterfy' ), 'queue' );
			$this->dispatch();
		}
	}
}
