<?php
/**
 * Resultado del análisis de visión de una imagen.
 *
 * @package FasterFy
 */

declare( strict_types=1 );

namespace FasterFy\AI;

defined( 'ABSPATH' ) || exit;

/**
 * Value object con la salida del modelo multimodal.
 */
final class VisionResult {

	public bool $success = false;
	public string $message = '';

	/** Indica si el fallo es transitorio (rate limit, red, 5xx) y conviene reintentar. */
	public bool $retryable = false;

	/** Segundos sugeridos de espera antes de reintentar (Retry-After). */
	public int $retry_after = 0;

	/** Texto alternativo (alt) denotativo y fáctico. */
	public string $alt = '';

	/** Título / leyenda sugeridos. */
	public string $title = '';

	/** Descripción detallada (1-2 frases) para el campo Descripción del adjunto. */
	public string $description = '';

	/** Términos clave para el renombrado semántico. */
	public string $keywords = '';

	/** Datos crudos / depuración. */
	public array $raw = [];

	/**
	 * Crea un resultado de éxito.
	 *
	 * @param array<string, mixed> $props Propiedades.
	 * @return self
	 */
	public static function ok( array $props = [] ): self {
		$r          = new self();
		$r->success = true;
		foreach ( $props as $k => $v ) {
			if ( property_exists( $r, $k ) ) {
				$r->{$k} = $v;
			}
		}
		return $r;
	}

	/**
	 * Crea un resultado de error.
	 *
	 * @param string $message     Mensaje.
	 * @param bool   $retryable   Si el fallo es transitorio y conviene reintentar.
	 * @param int    $retry_after Segundos sugeridos de espera.
	 * @return self
	 */
	public static function fail( string $message, bool $retryable = false, int $retry_after = 0 ): self {
		$r              = new self();
		$r->success     = false;
		$r->message     = $message;
		$r->retryable   = $retryable;
		$r->retry_after = max( 0, $retry_after );
		return $r;
	}
}
