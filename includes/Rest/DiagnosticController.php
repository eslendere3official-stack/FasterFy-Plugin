<?php
/**
 * Controlador REST de diagnóstico para FasterFy.
 * Provee endpoints de testing para verificar configuración de IA.
 *
 * @package FasterFy
 */

declare( strict_types=1 );

namespace FasterFy\Rest;

use FasterFy\AI\AIManager;
use FasterFy\Settings;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Endpoints de diagnóstico y testing.
 */
final class DiagnosticController {

	private Settings $settings;
	private AIManager $ai_manager;

	/**
	 * Constructor.
	 *
	 * @param Settings  $settings   Ajustes.
	 * @param AIManager $ai_manager Manager de IA.
	 */
	public function __construct( Settings $settings, AIManager $ai_manager ) {
		$this->settings   = $settings;
		$this->ai_manager = $ai_manager;
	}

	/**
	 * Registra las rutas REST de diagnóstico.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			'fasterfy/v1',
			'/diagnostic/ai',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'test_ai_config' ],
				'permission_callback' => static fn() => current_user_can( 'manage_options' ),
			]
		);

		register_rest_route(
			'fasterfy/v1',
			'/diagnostic/ai/connection',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'test_ai_connection' ],
				'permission_callback' => static fn() => current_user_can( 'manage_options' ),
			]
		);
	}

	/**
	 * Endpoint de diagnóstico de configuración de IA.
	 * Retorna un reporte detallado del estado de la configuración.
	 *
	 * GET /wp-json/fasterfy/v1/diagnostic/ai
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function test_ai_config( WP_REST_Request $request ): WP_REST_Response {
		$report = [];

		// 1. ¿IA habilitada?
		$ai_enabled = (bool) $this->settings->get( 'ai.enabled', false );
		$report['ai_enabled'] = [
			'value'  => $ai_enabled,
			'status' => $ai_enabled ? 'ok' : 'error',
			'message' => $ai_enabled
				? 'La IA está habilitada en la configuración.'
				: 'La IA está DESHABILITADA. Ve a Configuración → IA y habilítala.',
		];

		// 2. ¿API Key configurada?
		$has_key = $this->settings->has_api_key();
		$report['api_key'] = [
			'value'  => $has_key,
			'status' => $has_key ? 'ok' : 'error',
			'message' => $has_key
				? 'Hay una API Key configurada (cifrada).'
				: 'NO hay API Key. Ve a Configuración → IA y pega tu key.',
		];

		// 3. URL base del API
		$api_base = (string) $this->settings->get( 'ai.api_base', 'https://api.openai.com/v1' );
		$report['api_base'] = [
			'value'   => $api_base,
			'status'  => '' !== $api_base ? 'ok' : 'warning',
			'message' => '' !== $api_base
				? sprintf( 'URL base configurada: %s', $api_base )
				: 'URL base vacía (se usará el predeterminado de OpenAI).',
		];

		// 4. Modelo de visión
		$model = (string) $this->settings->get( 'ai.vision_model', 'gpt-4o-mini' );
		$report['vision_model'] = [
			'value'   => $model,
			'status'  => '' !== $model ? 'ok' : 'warning',
			'message' => '' !== $model
				? sprintf( 'Modelo de visión: %s', $model )
				: 'Modelo vacío (usa el predeterminado).',
		];

		// 5. Idioma
		$language = (string) $this->settings->get( 'ai.language', 'es' );
		$report['language'] = [
			'value'   => $language,
			'message' => sprintf( 'Idioma para generación de texto: %s', $language ),
		];

		// 6. Temperatura
		$temperature = (float) $this->settings->get( 'ai.temperature', 0.1 );
		$report['temperature'] = [
			'value'   => $temperature,
			'status'  => $temperature <= 0.3 ? 'ok' : 'warning',
			'message' => $temperature <= 0.3
				? sprintf( 'Temperatura: %.2f (óptimo para descripciones factuales).', $temperature )
				: sprintf( 'Temperatura: %.2f (alta, puede causar alucinaciones).', $temperature ),
		];

		// 7. Opciones de generación
		$generate_alt         = (bool) $this->settings->get( 'ai.generate_alt', true );
		$generate_title       = (bool) $this->settings->get( 'ai.generate_title', false );
		$generate_description = (bool) $this->settings->get( 'ai.generate_description', false );
		$semantic_rename      = (bool) $this->settings->get( 'ai.semantic_rename', false );

		$report['generation_options'] = [
			'generate_alt'         => $generate_alt,
			'generate_title'       => $generate_title,
			'generate_description' => $generate_description,
			'semantic_rename'      => $semantic_rename,
			'status'               => $generate_alt ? 'ok' : 'warning',
			'message'              => $generate_alt
				? 'Al menos "Generar Alt Text" está habilitado.'
				: 'ADVERTENCIA: "Generar Alt Text" está deshabilitado. No se generará nada.',
		];

		// 8. Moderación
		$moderation_enabled = (bool) $this->settings->get( 'moderation.enabled', false );
		$block_generative   = (bool) $this->settings->get( 'moderation.block_generative', true );

		$report['moderation'] = [
			'enabled'         => $moderation_enabled,
			'block_generative' => $block_generative,
			'message'         => $moderation_enabled
				? 'Moderación habilitada (se revisará contenido sensible antes de enviar a IA).'
				: 'Moderación deshabilitada.',
		];

		// 9. Estado general
		$is_usable = $ai_enabled && $has_key && $generate_alt;
		$report['overall'] = [
			'status'  => $is_usable ? 'ok' : 'error',
			'message' => $is_usable
				? '✅ Configuración básica completa. Prueba la conexión con /diagnostic/ai/connection'
				: '❌ Configuración incompleta. Revisa los errores arriba.',
		];

		return new WP_REST_Response( $report, 200 );
	}

	/**
	 * Endpoint de prueba de conexión con el proveedor de IA.
	 * Intenta listar modelos disponibles para verificar autenticación.
	 *
	 * GET /wp-json/fasterfy/v1/diagnostic/ai/connection
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function test_ai_connection( WP_REST_Request $request ): WP_REST_Response {
		if ( ! $this->ai_manager->is_enabled() ) {
			return new WP_REST_Response(
				[
					'ok'      => false,
					'message' => 'La IA no está habilitada o no tiene API Key configurada.',
				],
				400
			);
		}

		$health = $this->ai_manager->health();

		return new WP_REST_Response(
			[
				'ok'      => $health['ok'],
				'message' => $health['message'],
				'details' => [
					'api_base'      => $this->settings->get( 'ai.api_base', 'https://api.openai.com/v1' ),
					'vision_model'  => $this->settings->get( 'ai.vision_model', 'gpt-4o-mini' ),
					'test_endpoint' => 'GET /models (lista de modelos disponibles)',
				],
			],
			$health['ok'] ? 200 : 500
		);
	}
}

