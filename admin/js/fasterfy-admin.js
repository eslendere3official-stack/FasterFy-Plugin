/**
 * FasterFy — Panel SPA (JavaScript vanilla, sin dependencias de build).
 *
 * Consume la API REST fasterfy/v1 y renderiza un panel de control de nivel
 * SaaS: dashboard, biblioteca, ajustes (Lite/Pro), rendimiento y logs.
 */
( function () {
	'use strict';

	if ( typeof window.FasterFyData === 'undefined' ) {
		return;
	}

	var DATA = window.FasterFyData;

	/* ============================================================
	 * Cliente API
	 * ============================================================ */
	var Api = {
		request: function ( path, options ) {
			options = options || {};
			var url = DATA.restUrl.replace( /\/$/, '' ) + path;
			var opts = {
				method: options.method || 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': DATA.nonce
				}
			};
			if ( options.body ) {
				opts.body = JSON.stringify( options.body );
			}
			return fetch( url, opts ).then( function ( res ) {
				return res.json().then( function ( json ) {
					if ( ! res.ok || ( json && json.ok === false ) ) {
						throw new Error( ( json && json.message ) || ( 'HTTP ' + res.status ) );
					}
					return json;
				} );
			} );
		},
		get: function ( p ) { return this.request( p, { method: 'GET' } ); },
		post: function ( p, body ) { return this.request( p, { method: 'POST', body: body } ); },
		put: function ( p, body ) { return this.request( p, { method: 'PUT', body: body } ); },
		del: function ( p ) { return this.request( p, { method: 'DELETE' } ); }
	};

	/* ============================================================
	 * Estado global
	 * ============================================================ */
	var State = {
		route: 'dashboard',
		theme: localStorage.getItem( 'fasterfy_theme' ) || 'dark',
		settings: DATA.settings || {},
		caps: DATA.capabilities || {},
		summary: null,
		queue: null,
		media: { items: [], total: 0, page: 1, status: 'all', search: '', orderby: 'recent', date: '', selected: [], view: ( ( function () { try { return localStorage.getItem( 'fasterfy_media_view' ) || 'list'; } catch ( e ) { return 'list'; } } )() ), loading: false },
		logs: { items: [], total: 0, page: 1, loading: false },
		polling: null,
		driving: false,
		driveErrors: 0,
		notifications: [],
		notifOpen: false,
		notifUnread: 0
	};

	/* ============================================================
	 * Utilidades
	 * ============================================================ */
	function h( str ) {
		var d = document.createElement( 'div' );
		d.textContent = str == null ? '' : String( str );
		return d.innerHTML;
	}
	function bytes( n ) {
		n = Number( n ) || 0;
		if ( n < 1024 ) { return n + ' B'; }
		var u = [ 'KB', 'MB', 'GB', 'TB' ], i = -1;
		do { n /= 1024; i++; } while ( n >= 1024 && i < u.length - 1 );
		return n.toFixed( n < 10 ? 1 : 0 ) + ' ' + u[ i ];
	}
	function pct( a, b ) { return b > 0 ? Math.round( ( a / b ) * 100 ) : 0; }
	function isPro() { return State.settings.mode === 'pro'; }

	function toast( msg, type ) {
		type = type || 'info';
		pushNotif( msg, type ); // Guarda en el historial (campana).
		var wrap = document.querySelector( '.ff-toasts' );
		if ( ! wrap ) {
			wrap = document.createElement( 'div' );
			wrap.className = 'ff-toasts';
			document.body.appendChild( wrap );
		}
		var icons = { success: '✓', error: '✕', info: 'ℹ' };
		var t = document.createElement( 'div' );
		t.className = 'ff-toast ff-toast--' + type;
		t.innerHTML = '<span class="ff-toast__ico">' + ( icons[ type ] || 'ℹ' ) + '</span><span class="ff-toast__msg"></span>';
		t.querySelector( '.ff-toast__msg' ).textContent = msg;
		wrap.appendChild( t );
		// Duración según longitud del mensaje (mín. 5 s, máx. 9 s) para dar
		// tiempo a leer; además queda guardado en la campana.
		var dur = Math.min( 9000, Math.max( 5000, String( msg ).length * 90 ) );
		setTimeout( function () {
			t.style.opacity = '0';
			t.style.transform = 'translateY(-8px)';
			setTimeout( function () { t.remove(); }, 300 );
		}, dur );
	}

	/* ---- Centro de notificaciones (campana) ---- */
	function pushNotif( msg, type ) {
		State.notifications.unshift( { msg: String( msg ), type: type || 'info', time: Date.now() } );
		if ( State.notifications.length > 40 ) { State.notifications.pop(); }
		if ( ! State.notifOpen ) { State.notifUnread++; }
		refreshBellBadge();
	}

	function refreshBellBadge() {
		var b = document.querySelector( '.ff-bellbtn' );
		if ( ! b ) { return; }
		var badge = b.querySelector( '.ff-bellbtn__badge' );
		if ( State.notifUnread > 0 ) {
			if ( ! badge ) { badge = document.createElement( 'span' ); badge.className = 'ff-bellbtn__badge'; b.appendChild( badge ); }
			badge.textContent = State.notifUnread > 9 ? '9+' : String( State.notifUnread );
		} else if ( badge ) {
			badge.remove();
		}
	}

	function timeAgo( ts ) {
		var s = Math.round( ( Date.now() - ts ) / 1000 );
		if ( s < 60 ) { return 'hace ' + s + ' s'; }
		var m = Math.round( s / 60 );
		if ( m < 60 ) { return 'hace ' + m + ' min'; }
		var hr = Math.round( m / 60 );
		return 'hace ' + hr + ' h';
	}

	function renderNotifPanel() {
		var panel = document.getElementById( 'ff-notifpanel' );
		if ( ! panel ) { return; }
		panel.classList.toggle( 'is-open', !! State.notifOpen );
		if ( ! State.notifOpen ) { return; }
		var icons = { success: '✓', error: '✕', info: 'ℹ' };
		var list = State.notifications.length
			? State.notifications.map( function ( n ) {
				return '<div class="ff-notif ff-notif--' + n.type + '">' +
					'<span class="ff-notif__ico">' + ( icons[ n.type ] || 'ℹ' ) + '</span>' +
					'<div class="ff-notif__body"><span class="ff-notif__msg"></span>' +
					'<span class="ff-notif__time">' + timeAgo( n.time ) + '</span></div></div>';
			} ).join( '' )
			: '<div class="ff-notif__empty">No hay notificaciones todavía.</div>';
		panel.innerHTML =
			'<div class="ff-notif__head"><b>Notificaciones</b>' +
				( State.notifications.length ? '<button class="ff-btn ff-btn--sm ff-btn--ghost" data-action="notif-clear">Limpiar</button>' : '' ) +
			'</div><div class="ff-notif__list">' + list + '</div>';
		// Rellena los mensajes como texto (evita inyección de HTML).
		var msgs = panel.querySelectorAll( '.ff-notif__msg' );
		State.notifications.forEach( function ( n, i ) { if ( msgs[ i ] ) { msgs[ i ].textContent = n.msg; } } );
	}

	/* ============================================================
	 * Iconos (SVG inline)
	 * ============================================================ */
	var ICONS = {
		dashboard: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
		media: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5L5 20"/></svg>',
		settings: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V2.5a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
		perf: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/></svg>',
		logs: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>',
		ai: '<svg class="ff-nav__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>'
	};

	/* ============================================================
	 * Layout
	 * ============================================================ */
	var NAV = [
		{ id: 'dashboard', label: 'Resumen', icon: 'dashboard', lite: true },
		{ id: 'media', label: 'Biblioteca', icon: 'media', lite: true },
		{ id: 'performance', label: 'Rendimiento', icon: 'perf', lite: true },
		{ id: 'ai', label: 'SEO & Textos', icon: 'ai', lite: true },
		{ id: 'settings', label: 'Ajustes', icon: 'settings', lite: true },
		{ id: 'logs', label: 'Registros', icon: 'logs', lite: false }
	];

	/** Escudo de marca FasterFy (hexágono verde + rayo + chispa). */
	function brandMark( size ) {
		size = size || 32;
		return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
			'<path d="M24 2 44 13 44 35 24 46 4 35 4 13Z" fill="#33EE33"/>' +
			'<path d="M26 10 L15 27 L22 27 L19 39 L33 21 L25 21 Z" fill="#1F1F1F"/>' +
			'<path d="M33 20.5 L34.5 24.4 L38.4 25.9 L34.5 27.4 L33 31.3 L31.5 27.4 L27.6 25.9 L31.5 24.4 Z" fill="#ffffff"/>' +
		'</svg>';
	}

	function renderShell() {
		var app = document.getElementById( 'fasterfy-app' );
		app.removeAttribute( 'data-loading' );
		app.setAttribute( 'data-theme', State.theme );

		// El modo Lite oculta secciones técnicas.
		var navItems = NAV.filter( function ( n ) { return isPro() || n.lite !== false; } );
		if ( ! isPro() && State.route === 'logs' ) { State.route = 'dashboard'; }

		var nav = navItems.map( function ( n ) {
			return '<div class="ff-nav__item' + ( State.route === n.id ? ' is-active' : '' ) + '" data-route="' + n.id + '">' +
				ICONS[ n.icon ] + '<span>' + n.label + '</span></div>';
		} ).join( '' );

		app.innerHTML =
			'<div class="ff-shell">' +
				'<aside class="ff-sidebar">' +
					'<div class="ff-brand">' + brandMark( 32 ) + '<span class="ff-brand__name">Faster<i>Fy</i></span></div>' +
					'<div class="ff-brand__tag">Pro Media Optimizer</div>' +
					'<nav class="ff-nav">' + nav + '</nav>' +
					'<div class="ff-sidebar__foot">' +
						'<div class="ff-modeswitch" data-action="mode">' +
							'<button data-mode="lite" class="' + ( ! isPro() ? 'is-active' : '' ) + '">Lite</button>' +
							'<button data-mode="pro" class="' + ( isPro() ? 'is-active' : '' ) + '">Pro</button>' +
						'</div>' +
						'<p class="ff-mode-hint">' + ( isPro() ? 'Modo avanzado: control total.' : 'Modo simple: todo en un clic.' ) + '</p>' +
					'</div>' +
				'</aside>' +
				'<main class="ff-main" id="ff-view"></main>' +
				'<div class="ff-topright">' +
					'<button class="ff-bellbtn" data-action="notif-toggle" title="Notificaciones">🔔' +
						( State.notifUnread > 0 ? '<span class="ff-bellbtn__badge">' + ( State.notifUnread > 9 ? '9+' : State.notifUnread ) + '</span>' : '' ) +
					'</button>' +
					'<button class="ff-themebtn" data-action="theme" title="Cambiar tema">' + ( State.theme === 'dark' ? '☀' : '🌙' ) + '</button>' +
				'</div>' +
				'<div class="ff-notifpanel" id="ff-notifpanel"></div>' +
			'</div>';

		renderRoute();
		renderNotifPanel();
	}

	function renderRoute() {
		var view = document.getElementById( 'ff-view' );
		if ( ! view ) { return; }
		switch ( State.route ) {
			case 'dashboard': return viewDashboard( view );
			case 'media': return viewMedia( view );
			case 'performance': return viewPerformance( view );
			case 'ai': return viewAI( view );
			case 'settings': return viewSettings( view );
			case 'logs': return viewLogs( view );
		}
	}

	function topbar( title, subtitle, actions ) {
		return '<div class="ff-topbar"><div><h1>' + h( title ) + '</h1><p>' + h( subtitle ) + '</p></div>' +
			'<div class="ff-topbar__actions">' + ( actions || '' ) + '</div></div>';
	}

	function queuePill( status ) {
		var labels = { idle: 'Inactiva', running: 'Procesando', paused: 'Pausada', completed: 'Completada', exhausted: 'Sin créditos' };
		return '<span class="ff-pill ff-pill--' + status + '"><span class="ff-pill__dot"></span>' + ( labels[ status ] || status ) + '</span>';
	}

	/* ============================================================
	 * Vista: Dashboard
	 * ============================================================ */
	function viewDashboard( view ) {
		view.innerHTML = topbar( 'Resumen', 'Centro de operación: estado actual de tu biblioteca y acciones rápidas.',
			'<button class="ff-btn ff-btn--primary" data-action="start-queue" data-mode="' + ( State.settings.ai && State.settings.ai.enabled ? 'both' : 'optimize' ) + '">⚡ Optimizar todo</button>' ) +
			dashboardBanner() +
			'<div id="ff-dash-body"><div class="ff-empty"><span class="ff-spinner"></span> Cargando datos…</div></div>';

		State.heroIndex = 0;
		startHero();
		loadSummary().then( renderDashboardBody );
	}

	/* Banner/hero con slider de beneficios. */
	var HERO_SLIDES = [
		{ icon: '⚡', title: 'Hasta 80% más livianas', text: 'Convierte a WebP/AVIF y comprime automáticamente, sin perder calidad visible.' },
		{ icon: '🧠', title: 'Textos SEO automáticos', text: 'Genera alt text, títulos y descripciones para posicionar mejor tus imágenes.' },
		{ icon: '📦', title: 'Procesamiento masivo', text: 'Optimiza toda tu biblioteca por lotes, en segundo plano, sin bloquear tu sitio.' },
		{ icon: '↩', title: 'No destructivo', text: 'Guardamos el original: revierte cualquier imagen a su versión inicial con un clic.' }
	];

	function dashboardBanner() {
		var slides = HERO_SLIDES.map( function ( s, i ) {
			return '<div class="ff-hero__slide' + ( 0 === i ? ' is-active' : '' ) + '">' +
				'<span class="ff-hero__ico">' + s.icon + '</span>' +
				'<div><b>' + h( s.title ) + '</b><span>' + h( s.text ) + '</span></div></div>';
		} ).join( '' );
		var dots = HERO_SLIDES.map( function ( s, i ) {
			return '<button class="ff-hero__dot' + ( 0 === i ? ' is-active' : '' ) + '" data-action="hero-dot" data-i="' + i + '"></button>';
		} ).join( '' );
		return '<div class="ff-hero" id="ff-hero">' +
			'<div class="ff-hero__left">' +
				'<div class="ff-hero__brand">' + brandMark( 44 ) + '<div class="ff-hero__name">Faster<i>Fy</i><span>Pro Media Optimizer</span></div></div>' +
			'</div>' +
			'<div class="ff-hero__right">' +
				'<div class="ff-hero__slides">' + slides + '</div>' +
				'<div class="ff-hero__dots">' + dots + '</div>' +
			'</div>' +
		'</div>';
	}

	function heroGo( i ) {
		var hero = document.getElementById( 'ff-hero' );
		if ( ! hero ) { return; }
		var slides = hero.querySelectorAll( '.ff-hero__slide' );
		var dots = hero.querySelectorAll( '.ff-hero__dot' );
		if ( ! slides.length ) { return; }
		State.heroIndex = ( i + slides.length ) % slides.length;
		slides.forEach( function ( el, n ) { el.classList.toggle( 'is-active', n === State.heroIndex ); } );
		dots.forEach( function ( el, n ) { el.classList.toggle( 'is-active', n === State.heroIndex ); } );
	}

	function startHero() {
		if ( State.heroTimer ) { clearInterval( State.heroTimer ); }
		State.heroTimer = setInterval( function () {
			if ( ! document.getElementById( 'ff-hero' ) ) { clearInterval( State.heroTimer ); State.heroTimer = null; return; }
			heroGo( ( State.heroIndex || 0 ) + 1 );
		}, 4500 );
	}

	function renderDashboardBody() {
		var body = document.getElementById( 'ff-dash-body' );
		if ( ! body || ! State.summary ) { return; }
		var lib = State.summary.library;
		var q = State.queue || State.summary.queue;
		var saved = lib.total_saved || 0;
		var ratio = pct( lib.optimized, lib.total );
		var aiOn = State.settings.ai && State.settings.ai.enabled;

		// Resumen = OPERACIÓN: cuántos activos hay, qué falta y el estado de la
		// cola en vivo + acciones rápidas. (El impacto/beneficio vive en "Rendimiento".)
		body.innerHTML =
			'<div class="ff-grid ff-grid--stats ff-mt">' +
				statCard( 'Activos totales', lib.total, 'En la biblioteca de medios', '🖼️' ) +
				statCard( 'Optimizados', lib.optimized, ratio + '% del total', '✅' ) +
				statCard( 'Sin optimizar', lib.pending, 'Listos para procesar', '⏳' ) +
				( aiOn
					? statCard( 'Sin texto SEO', ( null != lib.ai_pending ? lib.ai_pending : 0 ), 'Pendientes de texto', '🏷️' )
					: statCard( 'Espacio ahorrado', bytes( saved ), 'Acumulado histórico', '💾' ) ) +
			'</div>' +
			'<div class="ff-card ff-card--pad-lg ff-mt-lg">' +
				'<h3>Estado del procesamiento ' + queuePill( q.status ) + '</h3>' +
				queuePanel( q ) +
			'</div>' +
			'<div class="ff-grid ff-grid--2 ff-mt-lg">' +
				dashboardQuickActions( aiOn ) +
				capabilitiesCard() +
			'</div>';
	}

	/** Tarjeta de acciones rápidas del Resumen (centro de operación). */
	function dashboardQuickActions( aiOn ) {
		var b = '<button class="ff-btn ff-btn--primary" data-action="start-queue" data-mode="' + ( aiOn ? 'both' : 'optimize' ) + '">⚡ Optimizar' + ( aiOn ? ' + textos' : ' todo' ) + '</button>';
		if ( aiOn ) { b += '<button class="ff-btn ff-btn--accent" data-action="start-queue" data-mode="ai">🧠 Generar textos</button>'; }
		b += '<button class="ff-btn" data-route="media">🖼️ Ir a la biblioteca</button>';
		b += '<button class="ff-btn ff-btn--danger" data-action="start-queue" data-mode="rollback">↩ Revertir todo</button>';
		return '<div class="ff-card ff-card--pad-lg"><h3>Acciones rápidas</h3>' +
			'<p class="ff-muted" style="margin:-6px 0 14px;font-size:13px">Lanza el procesamiento de toda la biblioteca. El progreso aparece arriba y continúa en segundo plano.</p>' +
			'<div class="ff-row" style="gap:10px;flex-wrap:wrap">' + b + '</div></div>';
	}

	function statCard( label, value, sub, ico ) {
		return '<div class="ff-card"><div class="ff-card__ico">' + ico + '</div>' +
			'<div class="ff-card__label">' + h( label ) + '</div>' +
			'<div class="ff-card__value">' + h( value ) + '</div>' +
			'<div class="ff-card__sub">' + h( sub ) + '</div>' +
			'<div class="ff-spark"></div></div>';
	}

	function queuePanel( q ) {
		var total = q.total || 0;
		var done = q.processed || 0;
		var p = pct( done, total );
		var running = q.status === 'running';
		var controls = '';
		if ( running ) {
			controls = '<button class="ff-btn ff-btn--sm" data-action="pause-queue">⏸ Pausar</button>' +
				'<button class="ff-btn ff-btn--sm ff-btn--danger" data-action="cancel-queue">✕ Detener</button>';
		} else if ( q.status === 'paused' ) {
			controls = '<button class="ff-btn ff-btn--sm ff-btn--accent" data-action="resume-queue">▶ Reanudar</button>' +
				'<button class="ff-btn ff-btn--sm ff-btn--danger" data-action="cancel-queue">✕ Detener</button>';
		} else {
			controls = '<button class="ff-btn ff-btn--sm ff-btn--primary" data-action="start-queue" data-mode="' + ( State.settings.ai && State.settings.ai.enabled ? 'both' : 'optimize' ) + '">⚡ Iniciar</button>';
		}

		var throttle = ( running && ( q.retry_after || 0 ) > 0 )
			? '<div class="ff-throttle">⏳ Ritmo ajustado al límite del proveedor de IA — reanudando en <b id="ff-throttle">' + q.retry_after + 's</b>… <span class="ff-muted">El proceso continúa solo.</span></div>'
			: '';

		return '<div class="ff-progress' + ( running ? ' is-active' : '' ) + '"><span style="width:' + p + '%"></span></div>' +
			throttle +
			'<div class="ff-queue-meta">' +
				'<div><b>' + done + ' / ' + total + '</b>Procesados</div>' +
				'<div><b>' + ( q.succeeded || 0 ) + '</b>Con éxito</div>' +
				'<div><b>' + ( q.skipped || 0 ) + '</b>Omitidos</div>' +
				'<div><b>' + ( q.failed || 0 ) + '</b>Errores</div>' +
			'</div>' +
			'<div class="ff-row ff-mt">' + controls +
				'<span class="ff-muted" style="font-size:12px">Motor: ' + h( q.engine || '—' ) + '</span></div>';
	}

	function byTypeList( byType ) {
		byType = byType || {};
		var names = { 'image/jpeg': 'JPEG → WebP/AVIF', 'image/jpg': 'JPG → WebP/AVIF', 'image/png': 'PNG (compresión)', 'image/svg+xml': 'SVG (sanitizado)' };
		var rows = Object.keys( byType ).map( function ( k ) {
			return '<div class="ff-row" style="justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--ff-border)">' +
				'<span class="ff-muted">' + h( names[ k ] || k ) + '</span><b>' + byType[ k ] + '</b></div>';
		} ).join( '' );
		return '<div class="ff-mt">' + ( rows || '<p class="ff-muted">Sin activos.</p>' ) + '</div>';
	}

	function capabilitiesCard() {
		var c = State.caps.image || {};
		function cap( on, label ) {
			return '<div class="ff-cap"><span class="ff-cap__dot ' + ( on ? 'on' : 'off' ) + '"></span>' + label + '</div>';
		}
		return '<div class="ff-card ff-mt-lg"><h3>Capacidades del servidor</h3><div class="ff-caps">' +
			cap( c.imagick, 'Imagick' ) + cap( c.gd, 'GD' ) +
			cap( c.webp, 'WebP' ) + cap( c.avif, 'AVIF' ) +
			cap( c.png_quantize, 'Cuantización PNG' ) +
			cap( State.caps.queue_engine === 'action_scheduler', 'Action Scheduler' ) +
			'</div><p class="ff-muted ff-mt" style="font-size:12px">Motor de cola: <b>' + h( State.caps.queue_engine ) + '</b></p></div>';
	}

	/* ============================================================
	 * Vista: Biblioteca (medios)
	 * ============================================================ */
	function viewMedia( view ) {
		view.innerHTML = topbar( 'Biblioteca', 'Optimización retroactiva y mutación nativa de medios.', '' ) +
			bulkActionsCard() +
			'<div class="ff-toolbar" style="justify-content:space-between;flex-wrap:wrap;gap:10px">' +
				'<div class="ff-tabs" data-action="media-tab" style="flex-wrap:wrap">' +
					tabBtn( 'all', 'Todos' ) + tabBtn( 'pending', 'Sin optimizar' ) + tabBtn( 'optimized', 'Optimizados' ) +
					( ( State.settings.ai && State.settings.ai.enabled )
						? ( tabBtn( 'ai_done', 'Con texto SEO' ) + tabBtn( 'ai_pending', 'Sin texto' ) + ( isPro() ? tabBtn( 'ai_error', 'Texto con error' ) : '' ) )
						: '' ) +
				'</div>' +
				'<div class="ff-tabs" data-action="media-view">' +
					'<button data-view="list" class="' + ( 'grid' !== State.media.view ? 'is-active' : '' ) + '">☰ Lista</button>' +
					'<button data-view="grid" class="' + ( 'grid' === State.media.view ? 'is-active' : '' ) + '">▦ Cuadrícula</button>' +
				'</div>' +
			'</div>' +
			'<div class="ff-filterbar">' +
				'<input type="search" class="ff-input ff-filterbar__search" id="ff-search" placeholder="🔍 Buscar por nombre…" value="' + h( State.media.search ) + '">' +
				'<div class="ff-filterbar__group">' +
					'<label class="ff-filterbar__field"><span>Mostrar</span>' +
						'<select class="ff-select" id="ff-datefilter" title="Mostrar solo imágenes subidas recientemente">' +
							dateOpt( '', 'Todas las fechas' ) + dateOpt( '24h', 'Subidas hoy (24 h)' ) +
							dateOpt( '7d', 'Últimos 7 días' ) + dateOpt( '30d', 'Últimos 30 días' ) +
						'</select>' +
					'</label>' +
					'<label class="ff-filterbar__field"><span>Ordenar</span>' +
						'<select class="ff-select" id="ff-orderby">' +
							sortOpt( 'recent', 'Últimas añadidas' ) + sortOpt( 'oldest', 'Más antiguas' ) +
							sortOpt( 'savings', 'Mayor ahorro' ) + sortOpt( 'title', 'Nombre (A-Z)' ) + sortOpt( 'type', 'Tipo de archivo' ) +
						'</select>' +
					'</label>' +
				'</div>' +
			'</div>' +
			'<div class="ff-card"><div id="ff-media-table"></div></div>';
		loadMedia();
		refreshQueueStatus();
	}

	/**
	 * Tarjeta de acciones masivas. En modo Lite muestra un único botón
	 * "todo en uno"; en modo Pro muestra las 3 acciones con descripción.
	 */
	function bulkActionsCard() {
		var aiOn = State.settings.ai && State.settings.ai.enabled;
		var pro = isPro();
		var btns, hint;

		if ( ! pro ) {
			// Lite: una sola acción "todo en uno" (optimiza y, si la IA está
			// activa, también genera textos) + revertir. Máxima simplicidad.
			btns = '<button class="ff-btn ff-btn--primary ff-btn--lg" data-action="start-queue" data-mode="' + ( aiOn ? 'both' : 'optimize' ) + '">✨ Optimizar todo' + ( aiOn ? ' + textos' : '' ) + '</button>';
			btns += '<button class="ff-btn ff-btn--danger" data-action="start-queue" data-mode="rollback">↩ Revertir todo</button>';
			hint = 'Modo simple: un clic optimiza toda tu biblioteca' + ( aiOn ? ' y genera los textos SEO' : '' ) + '. El proceso continúa en segundo plano aunque cierres la pestaña. Cambia a <b>Pro</b> para acciones separadas y control por estado.';
		} else {
			// Pro: acciones granulares + gestión de reintentos.
			btns = '<button class="ff-btn ff-btn--primary" data-action="start-queue" data-mode="optimize">⚡ Optimizar todo</button>';
			if ( aiOn ) {
				btns += '<button class="ff-btn ff-btn--accent" data-action="start-queue" data-mode="ai">🧠 Generar textos en todo</button>';
				btns += '<button class="ff-btn ff-btn--ghost" data-action="ai-reset-failed" title="Reintentar las imágenes cuyo texto SEO falló">🔁 Reintentar fallidas</button>';
			}
			btns += '<button class="ff-btn ff-btn--danger" data-action="start-queue" data-mode="rollback">↩ Revertir todo</button>';
			hint = 'Modo Pro: control total. Aplica cada acción por separado a toda la biblioteca, por lotes. El proceso continúa en segundo plano aunque cierres la pestaña.';
		}

		return '<div class="ff-card ff-card--pad-lg" style="margin-bottom:18px">' +
			'<div class="ff-row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">Acciones masivas</h3><span class="ff-modebadge ff-modebadge--' + ( pro ? 'pro' : 'lite' ) + '">' + ( pro ? 'PRO' : 'LITE' ) + '</span></div>' +
			'<p class="ff-muted" style="margin:6px 0 16px;font-size:13px">' + hint + '</p>' +
			'<div class="ff-row" id="ff-bulk-buttons" style="gap:10px;flex-wrap:wrap">' + btns + '</div>' +
			( aiOn ? '' : '<p class="ff-muted ff-mt" style="font-size:12px">💡 Activa la generación de textos en la pestaña <b>SEO & Textos</b>.</p>' ) +
			'<div id="ff-media-queue" class="ff-mt"></div>' +
		'</div>';
	}

	function sortOpt( v, label ) {
		return '<option value="' + v + '"' + ( State.media.orderby === v ? ' selected' : '' ) + '>' + label + '</option>';
	}
	function dateOpt( v, label ) {
		return '<option value="' + v + '"' + ( State.media.date === v ? ' selected' : '' ) + '>' + label + '</option>';
	}

	/** Consulta el estado de la cola y pinta la barra de progreso de la Biblioteca. */
	function refreshQueueStatus() {
		return Api.get( '/queue/status' ).then( function ( res ) {
			State.queue = res.queue;
			if ( State.summary ) { State.summary.library = res.library; State.summary.queue = res.queue; }
			renderMediaQueueBar();
			if ( res.queue.status === 'running' ) { startDriving(); }
		} ).catch( function () {} );
	}

	/** Etiqueta legible del modo de cola. */
	function queueModeLabel( mode ) {
		if ( 'ai' === mode ) { return '(textos SEO)'; }
		if ( 'both' === mode ) { return '(optimización + textos)'; }
		return '(optimización)';
	}

	/** Pinta la barra de progreso de la cola dentro de la Biblioteca. */
	function renderMediaQueueBar() {
		var el = document.getElementById( 'ff-media-queue' );
		if ( ! el ) { return; }
		var q = State.queue;
		if ( ! q || 'idle' === q.status ) { el.innerHTML = ''; return; }
		el.innerHTML = '<div style="border-top:1px solid var(--ff-border);padding-top:16px;margin-top:6px">' +
			'<div class="ff-row" style="justify-content:space-between;margin-bottom:10px">' +
				'<b>Progreso ' + queueModeLabel( q.mode ) + '</b>' + queuePill( q.status ) +
			'</div>' + queuePanel( q ) + '</div>';
	}

	/** Refresca cualquier vista de cola visible (dashboard y/o biblioteca). */
	function updateQueueViews() {
		if ( document.getElementById( 'ff-dash-body' ) ) { renderDashboardBody(); }
		if ( document.getElementById( 'ff-media-queue' ) ) { renderMediaQueueBar(); }
		updateProcessingModal();
	}

	function tabBtn( id, label ) {
		return '<button data-status="' + id + '" class="' + ( State.media.status === id ? 'is-active' : '' ) + '">' + label + '</button>';
	}

	/** ¿Está seleccionado este id? */
	function isSelected( id ) { return State.media.selected.indexOf( id ) >= 0; }

	/** Casilla de selección de un elemento. */
	function selCheck( it ) {
		return '<input type="checkbox" class="ff-check" data-action="select" data-id="' + it.id + '"' + ( isSelected( it.id ) ? ' checked' : '' ) + ' title="Seleccionar">';
	}

	/** ¿Están seleccionados todos los de la página actual? */
	function allPageSelected() {
		return State.media.items.length > 0 && State.media.items.every( function ( it ) { return isSelected( it.id ); } );
	}

	/** Barra superior de la galería: "Seleccionar todo" + acciones sobre la selección. */
	function mediaTopBar() {
		var n = State.media.selected.length;
		var aiOn = State.settings.ai && State.settings.ai.enabled;
		var left = '<label class="ff-selall"><input type="checkbox" class="ff-check" data-action="select-all"' + ( allPageSelected() ? ' checked' : '' ) + '> Seleccionar todo' + ( n ? ' · ' + n + ' elegida(s)' : '' ) + '</label>' +
			'<span class="ff-muted" style="font-size:12px">Toca la <b>miniatura</b> para seleccionar · toca los <b>datos</b> para ver la ficha</span>';
		var right = '';
		if ( n ) {
			right = '<button class="ff-btn ff-btn--sm ff-btn--primary" data-action="sel-optimize">⚡ Optimizar</button>';
			if ( aiOn ) { right += '<button class="ff-btn ff-btn--sm ff-btn--accent" data-action="sel-ai">🧠 Generar texto SEO</button>'; }
			right += '<button class="ff-btn ff-btn--sm ff-btn--danger" data-action="sel-rollback">↩ Revertir</button>';
			right += '<button class="ff-btn ff-btn--sm ff-btn--ghost" data-action="sel-clear">Limpiar</button>';
		}
		return '<div class="ff-selbar' + ( n ? ' is-active' : '' ) + '"><div class="ff-row" style="gap:10px">' + left + '</div>' +
			'<div class="ff-row" style="gap:8px;flex-wrap:wrap">' + right + '</div></div>';
	}

	/** Botones de acción de un elemento (compartidos por lista y cuadrícula). */
	function mediaItemActions( it ) {
		var a = '<button class="ff-btn ff-btn--sm ff-btn--ghost" data-action="detail" data-id="' + it.id + '">Detalles</button>';
		a += '<button class="ff-btn ff-btn--sm" data-action="optimize-one" data-id="' + it.id + '">Optimizar</button>';
		if ( State.settings.ai && State.settings.ai.enabled ) {
			a += '<button class="ff-btn ff-btn--sm" data-action="ai-one" data-id="' + it.id + '">Texto SEO</button>';
		}
		if ( it.has_backup ) {
			a += '<button class="ff-btn ff-btn--sm ff-btn--danger" data-action="rollback-one" data-id="' + it.id + '">Revertir</button>';
		}
		return a;
	}

	/* ============================================================
	 * Vista de detalle (ficha completa de una imagen)
	 * ============================================================ */
	function openDetail( id ) {
		State.detailId = id;
		showDetailOverlay( '<div class="ff-empty"><span class="ff-spinner"></span> Cargando ficha…</div>' );
		Api.get( '/media/detail?id=' + id ).then( function ( res ) {
			renderDetailModal( res.detail );
		} ).catch( function ( e ) { toast( e.message, 'error' ); closeDetail(); } );
	}

	/** Índice del elemento actualmente abierto dentro de la página cargada. */
	function detailIndex() {
		var items = State.media.items || [];
		for ( var i = 0; i < items.length; i++ ) {
			if ( items[ i ].id === State.detailId ) { return i; }
		}
		return -1;
	}

	/** Navega a la imagen anterior/siguiente (dir = -1 | +1) dentro de la galería. */
	function detailNav( dir ) {
		var items = State.media.items || [];
		var idx = detailIndex();
		if ( idx < 0 ) { return; }
		var ni = idx + dir;
		if ( ni < 0 || ni >= items.length ) {
			toast( dir < 0 ? 'Primera imagen de la página.' : 'Última imagen de la página.', 'info' );
			return;
		}
		openDetail( items[ ni ].id );
	}

	function showDetailOverlay( inner ) {
		var ov = document.getElementById( 'ff-detail' );
		if ( ! ov ) {
			ov = document.createElement( 'div' );
			ov.id = 'ff-detail';
			ov.className = 'ff-modal';
			document.getElementById( 'fasterfy-app' ).appendChild( ov );
		}
		ov.innerHTML = '<div class="ff-modal__overlay" data-action="detail-close"></div><div class="ff-modal__panel">' + inner + '</div>';
	}

	function closeDetail() {
		var ov = document.getElementById( 'ff-detail' );
		if ( ov ) { ov.remove(); }
		State.detailId = null;
	}

	/* ============================================================
	 * Modal amigable de "procesando en segundo plano"
	 * ============================================================ */
	var PROC_TIPS = [
		'Convertimos tus imágenes a formatos ultraligeros (WebP/AVIF) sin perder calidad visible.',
		'Cada imagen optimizada acelera tu web y mejora tu posicionamiento en Google.',
		'Guardamos el original de cada imagen: puedes revertir cualquier cambio con un clic.',
		'Imágenes más ligeras = mejor experiencia en móvil y mejores Core Web Vitals.',
		'Los textos alternativos mejoran la accesibilidad y el SEO de tus imágenes.'
	];

	function showProcessingModal( mode ) {
		closeProcessingModal();
		var label = 'ai' === mode ? 'Generando textos SEO'
			: ( 'rollback' === mode ? 'Revirtiendo imágenes' : 'Optimizando tu biblioteca' );
		var ov = document.createElement( 'div' );
		ov.id = 'ff-procmodal';
		ov.className = 'ff-modal';
		ov.innerHTML =
			'<div class="ff-modal__overlay" data-action="proc-close"></div>' +
			'<div class="ff-modal__panel ff-procmodal">' +
				'<div class="ff-procmodal__ico">' + brandMark( 54 ) + '</div>' +
				'<h2>' + label + '…</h2>' +
				'<p class="ff-procmodal__lead">Esto puede tardar unos minutos. <b>Puedes seguir usando WordPress con normalidad</b>, cambiar de página o incluso cerrar esta pestaña: el proceso continúa en segundo plano. ☕</p>' +
				'<div class="ff-procmodal__bar"><span id="ff-procbar" style="width:0%"></span></div>' +
				'<div class="ff-procmodal__meta" id="ff-procmeta">Preparando…</div>' +
				'<div class="ff-procmodal__tip">💡 <span id="ff-proctip">' + h( PROC_TIPS[ 0 ] ) + '</span></div>' +
				'<button class="ff-btn ff-btn--primary ff-btn--lg" data-action="proc-close">Entendido, seguir en segundo plano</button>' +
			'</div>';
		document.getElementById( 'fasterfy-app' ).appendChild( ov );

		var i = 0;
		State.procTipTimer = setInterval( function () {
			var el = document.getElementById( 'ff-proctip' );
			if ( ! el ) { clearInterval( State.procTipTimer ); State.procTipTimer = null; return; }
			i = ( i + 1 ) % PROC_TIPS.length;
			el.style.opacity = '0';
			setTimeout( function () { if ( el ) { el.textContent = PROC_TIPS[ i ]; el.style.opacity = '1'; } }, 250 );
		}, 4000 );

		updateProcessingModal();
	}

	function updateProcessingModal() {
		var q = State.queue;
		var bar = document.getElementById( 'ff-procbar' );
		if ( ! bar || ! q ) { return; }
		var p = q.total > 0 ? Math.round( ( q.processed / q.total ) * 100 ) : 0;
		bar.style.width = p + '%';
		var meta = document.getElementById( 'ff-procmeta' );
		if ( meta ) {
			var txt = ( q.processed || 0 ) + ' / ' + ( q.total || 0 ) + ' procesadas';
			if ( ( q.retry_after || 0 ) > 0 ) { txt += ' · esperando al proveedor…'; }
			meta.textContent = txt;
		}
	}

	function closeProcessingModal() {
		var ov = document.getElementById( 'ff-procmodal' );
		if ( ov ) { ov.remove(); }
		if ( State.procTipTimer ) { clearInterval( State.procTipTimer ); State.procTipTimer = null; }
	}

	function detailRow( label, value ) {
		return '<div class="ff-drow"><span>' + h( label ) + '</span><b>' + value + '</b></div>';
	}

	function renderDetailModal( d ) {
		var statusBadge = '<span class="ff-badge ff-badge--' + d.status + '">' + h( d.status ) + '</span>';
		var aiB = aiBadge( d );
		var conv = ( d.format_from && d.format_to && d.format_from !== d.format_to )
			? ( h( d.format_from ) + ' → ' + h( d.format_to ) )
			: h( d.mime );
		var savings = d.original_size
			? ( '<b style="color:var(--ff-primary)">' + bytes( d.saved_bytes ) + '</b> (' + d.savings_percent + '%)' )
			: '<span class="ff-muted">—</span>';

		var info = detailRow( 'Estado', statusBadge + ' ' + ( aiB || '' ) ) +
			detailRow( 'Formato', conv ) +
			detailRow( 'Dimensiones', d.width && d.height ? ( d.width + ' × ' + d.height + ' px' ) : '—' ) +
			detailRow( 'Tamaño actual', d.filesize ? bytes( d.filesize ) : '—' ) +
			( d.original_size ? detailRow( 'Tamaño original', bytes( d.original_size ) ) : '' ) +
			( d.optimized_size ? detailRow( 'Tamaño optimizado', bytes( d.optimized_size ) ) : '' ) +
			detailRow( 'Ahorro', savings ) +
			( d.renamed_to ? detailRow( 'Renombrado a', h( d.renamed_to ) ) : '' ) +
			( d.optimized_at ? detailRow( 'Optimizado el', h( d.optimized_at ) + ' UTC' ) : '' ) +
			detailRow( 'Respaldo', d.has_backup ? 'Sí ✓' : 'No' );

		function textBlock( label, val ) {
			return '<div class="ff-dtext"><label>' + h( label ) + '</label><p>' + ( val ? h( val ) : '<i class="ff-muted">— vacío —</i>' ) + '</p></div>';
		}

		var actions = '<button class="ff-btn ff-btn--sm" data-action="optimize-one" data-id="' + d.id + '">⚡ Optimizar</button>';
		if ( State.settings.ai && State.settings.ai.enabled ) { actions += '<button class="ff-btn ff-btn--sm ff-btn--accent" data-action="ai-one" data-id="' + d.id + '">🧠 Generar texto SEO</button>'; }
		if ( d.has_backup ) { actions += '<button class="ff-btn ff-btn--sm ff-btn--danger" data-action="rollback-one" data-id="' + d.id + '">↩ Revertir</button>'; }
		if ( d.edit_link ) { actions += '<a class="ff-btn ff-btn--sm ff-btn--ghost" href="' + d.edit_link + '" target="_blank" rel="noopener">Abrir en WP ↗</a>'; }

		var idx = detailIndex();
		var hasPrev = idx > 0;
		var hasNext = idx >= 0 && idx < ( State.media.items.length - 1 );
		var navBtns =
			'<button class="ff-modal__nav ff-modal__nav--prev" data-action="detail-prev" title="Anterior (←)"' + ( hasPrev ? '' : ' disabled' ) + '>‹</button>' +
			'<button class="ff-modal__nav ff-modal__nav--next" data-action="detail-next" title="Siguiente (→)"' + ( hasNext ? '' : ' disabled' ) + '>›</button>';

		var html =
			'<button class="ff-modal__close" data-action="detail-close" title="Cerrar (Esc)">✕</button>' +
			navBtns +
			'<div class="ff-detail">' +
				'<div class="ff-detail__media"><img src="' + ( d.preview || d.url || '' ) + '" alt=""><div class="ff-detail__file">' + h( d.filename ) + ' · #' + d.id + '</div></div>' +
				'<div class="ff-detail__info">' +
					'<h3 style="margin-top:0">' + ( d.title ? h( d.title ) : 'Imagen #' + d.id ) + '</h3>' +
					'<div class="ff-dgrid">' + info + '</div>' +
					'<div class="ff-section-title" style="margin:18px 0 10px">Textos (SEO)</div>' +
					textBlock( 'Texto alternativo (alt)', d.alt ) +
					textBlock( 'Título', d.title ) +
					textBlock( 'Leyenda', d.caption ) +
					textBlock( 'Descripción', d.description ) +
					'<div class="ff-row ff-mt" style="gap:8px;flex-wrap:wrap">' + actions + '</div>' +
				'</div>' +
			'</div>';
		showDetailOverlay( html );
	}

	/** Etiqueta del estado de IA. */
	function aiBadge( it ) {
		if ( 'error' === it.ai_status ) { return '<span class="ff-badge ff-badge--error">SEO ✕</span>'; }
		if ( 'done' === it.ai_status ) { return '<span class="ff-badge ff-badge--optimized">SEO ✓</span>'; }
		if ( 'blocked' === it.ai_status ) { return '<span class="ff-badge ff-badge--blocked">bloqueado</span>'; }
		return '';
	}

	/** Tarjeta de un elemento para la vista en cuadrícula. */
	function mediaCard( it ) {
		// Toda la tarjeta es seleccionable (data-action="card-select"). Los botones
		// internos tienen su propia acción, así que no interfieren. Para abrir la
		// ficha se usa el botón "Detalles".
		// Miniatura = seleccionar (check); área de datos = abrir ficha detallada.
		// Los botones internos y el checkbox tienen su propia acción y mandan.
		return '<div class="ff-mcard ff-mcard--pick' + ( isSelected( it.id ) ? ' is-selected' : '' ) + '" data-action="card-detail" data-id="' + it.id + '">' +
			'<div class="ff-mcard__thumb" data-action="card-select" data-id="' + it.id + '" title="Clic para seleccionar">' +
				'<span class="ff-mcard__check">' + selCheck( it ) + '</span>' +
				'<img src="' + ( it.thumb || '' ) + '" alt="" loading="lazy">' +
				'<span class="ff-mcard__pickhint">✓ Seleccionar</span>' +
			'</div>' +
			'<div class="ff-mcard__body">' +
				'<div class="ff-row" style="gap:6px;flex-wrap:wrap">' +
					'<span class="ff-badge ff-badge--' + it.status + '">' + h( it.status ) + '</span>' + aiBadge( it ) +
				'</div>' +
				'<div class="ff-mcard__alt">' + ( it.alt ? h( it.alt ) : '<i class="ff-muted">sin alt text</i>' ) + '</div>' +
				( it.saved_bytes ? '<div class="ff-muted" style="font-size:11px">Ahorro: <b style="color:var(--ff-accent)">' + bytes( it.saved_bytes ) + '</b></div>' : '' ) +
				'<div class="ff-row-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-top:auto">' + mediaItemActions( it ) + '</div>' +
			'</div>' +
		'</div>';
	}

	function renderMediaTable() {
		var el = document.getElementById( 'ff-media-table' );
		if ( ! el ) { return; }
		if ( State.media.loading ) {
			el.innerHTML = '<div class="ff-empty"><span class="ff-spinner"></span> Cargando…</div>';
			return;
		}
		if ( ! State.media.items.length ) {
			el.innerHTML = '<div class="ff-empty">No hay activos en esta vista.</div>';
			return;
		}

		var pages = Math.ceil( State.media.total / 24 );
		var pager = pagination( State.media.page, pages, 'media-page' );
		var bar   = mediaTopBar();

		// Vista en cuadrícula (ideal para pantallas pequeñas).
		if ( 'grid' === State.media.view ) {
			el.innerHTML = bar + '<div class="ff-mediagrid">' + State.media.items.map( mediaCard ).join( '' ) + '</div>' + pager;
			return;
		}

		// Vista en lista (tabla).
		var rows = State.media.items.map( function ( it ) {
			var badge = '<span class="ff-badge ff-badge--' + it.status + '">' + h( it.status ) + '</span>';
			return '<tr data-action="card-detail" data-id="' + it.id + '" class="ff-row-pick' + ( isSelected( it.id ) ? ' is-selected' : '' ) + '">' +
				'<td>' + selCheck( it ) + '</td>' +
				'<td><img class="ff-thumb" data-action="card-select" data-id="' + it.id + '" title="Clic para seleccionar" src="' + ( it.thumb || '' ) + '" alt="" loading="lazy"></td>' +
				'<td><b>#' + it.id + '</b><br><span class="ff-muted">' + h( it.mime ) + '</span></td>' +
				'<td>' + badge + ( it.format_to ? '<br><span class="ff-muted" style="font-size:11px">' + h( it.format_to ) + '</span>' : '' ) + '</td>' +
				'<td>' + ( it.saved_bytes ? '<b style="color:var(--ff-accent)">' + bytes( it.saved_bytes ) + '</b>' : '<span class="ff-muted">—</span>' ) + '</td>' +
				'<td class="ff-muted" style="max-width:280px">' + ( it.alt ? h( it.alt ) : '<i>sin alt text</i>' ) + ' ' + aiBadge( it ) + '</td>' +
				'<td><div class="ff-row-actions">' + mediaItemActions( it ) + '</div></td>' +
			'</tr>';
		} ).join( '' );

		el.innerHTML = bar +
			'<table class="ff-table"><thead><tr>' +
				'<th style="width:32px"></th><th></th><th>ID</th><th>Estado</th><th>Ahorro</th><th>Texto alternativo (SEO)</th><th></th>' +
			'</tr></thead><tbody>' + rows + '</tbody></table>' + pager;
	}

	function pagination( page, pages, action ) {
		if ( pages <= 1 ) { return ''; }
		return '<div class="ff-paging">' +
			'<button class="ff-btn ff-btn--sm" data-action="' + action + '" data-page="' + ( page - 1 ) + '"' + ( page <= 1 ? ' disabled' : '' ) + '>←</button>' +
			'<span class="ff-muted">Página ' + page + ' de ' + pages + '</span>' +
			'<button class="ff-btn ff-btn--sm" data-action="' + action + '" data-page="' + ( page + 1 ) + '"' + ( page >= pages ? ' disabled' : '' ) + '>→</button>' +
		'</div>';
	}

	/* ============================================================
	 * Vista: Rendimiento (Performance Tracker)
	 * ============================================================ */
	function viewPerformance( view ) {
		view.innerHTML = topbar( 'Rendimiento', 'Impacto de FasterFy en el peso de tu sitio y en Web Core Vitals (estimación).', '' ) +
			'<div id="ff-perf-body"><div class="ff-empty"><span class="ff-spinner"></span> Calculando…</div></div>';
		loadSummary().then( renderPerformance );
	}

	function msHuman( ms ) {
		return ms >= 1000 ? ( ms / 1000 ).toFixed( 1 ) + ' s' : ms + ' ms';
	}

	function renderPerformance() {
		var body = document.getElementById( 'ff-perf-body' );
		if ( ! body || ! State.summary ) { return; }
		var lib = State.summary.library;
		var saved = lib.total_saved || 0;
		var optimized = lib.optimized || 0;
		var total = lib.total || 0;
		var ratio = pct( optimized, total );
		var avgConn = 1.5 * 1024 * 1024 / 8; // ~1.5 Mbps en bytes/s.
		var msSaved = Math.round( ( saved / avgConn ) * 1000 );
		var avgPerImg = optimized ? Math.round( saved / optimized ) : 0;
		var afterW = Math.max( 15, 100 - Math.round( ratio * 0.6 ) );
		var lcpGain = Math.min( 60, Math.round( ratio * 0.6 ) );

		body.innerHTML =
			'<div class="ff-grid ff-grid--stats ff-mt">' +
				statCard( 'Espacio ahorrado', bytes( saved ), 'Total acumulado', '💾' ) +
				statCard( 'Imágenes optimizadas', optimized, ratio + '% de la biblioteca', '✅' ) +
				statCard( 'Carga salvada (est.)', msHuman( msSaved ), 'Conexión móvil ~1.5 Mbps', '⚡' ) +
				statCard( 'Ahorro medio/imagen', bytes( avgPerImg ), 'Por activo optimizado', '📉' ) +
			'</div>' +
			'<div class="ff-grid ff-grid--2 ff-mt-lg">' +
				'<div class="ff-card ff-card--pad-lg"><h3>Progreso de optimización</h3>' +
					'<div class="ff-ring">' + perfDonut( ratio ) +
						'<div><div class="ff-card__sub">Optimizadas <b style="color:var(--ff-text)">' + optimized + '</b></div>' +
						'<div class="ff-card__sub" style="margin-top:6px">Pendientes <b style="color:var(--ff-text)">' + ( lib.pending || 0 ) + '</b></div>' +
						'<div class="ff-card__sub" style="margin-top:6px">Total <b style="color:var(--ff-text)">' + total + '</b></div></div>' +
					'</div>' +
				'</div>' +
				'<div class="ff-card ff-card--pad-lg"><h3>Composición de la biblioteca</h3>' + perfTypeBars( lib.by_type ) + '</div>' +
			'</div>' +
			'<div class="ff-card ff-card--pad-lg ff-mt-lg">' +
				'<h3>Comparativa antes / después</h3>' +
				'<div class="ff-compare"><div class="ff-compare__bar"><i>Antes — peso relativo de imágenes</i>' +
					'<div class="ff-bar-track ff-bar-before"><span data-grow="100%" style="width:0">100%</span></div></div></div>' +
				'<div class="ff-compare"><div class="ff-compare__bar"><i>Después de FasterFy <span class="ff-badge ff-badge--optimized">−' + ( 100 - afterW ) + '%</span></i>' +
					'<div class="ff-bar-track ff-bar-after"><span data-grow="' + afterW + '%" style="width:0">' + afterW + '%</span></div></div></div>' +
				'<div class="ff-metrics ff-mt-lg">' +
					'<div class="ff-metric"><b>' + bytes( saved ) + '</b><small>menos que transferir</small></div>' +
					'<div class="ff-metric"><b>' + msHuman( msSaved ) + '</b><small>tiempo de carga salvado</small></div>' +
					'<div class="ff-metric"><b>−' + lcpGain + '%</b><small>mejora estimada de LCP</small></div>' +
				'</div>' +
				'<p class="ff-muted ff-mt" style="font-size:12px">* Estimaciones a partir del volumen de bytes optimizados. Para métricas reales de Core Web Vitals, conecta Google PageSpeed Insights mediante el hook <code>fasterfy_performance_metrics</code>.</p>' +
			'</div>';

		animatePerf();
	}

	function perfDonut( ratio ) {
		var circ = 2 * Math.PI * 54;
		var off = circ - ( circ * ratio / 100 );
		return '<div class="ff-donut">' +
			'<svg width="150" height="150" viewBox="0 0 150 150">' +
				'<defs><linearGradient id="ffgrad" x1="0" y1="0" x2="1" y2="1">' +
					'<stop offset="0%" stop-color="#33ee33"/><stop offset="100%" stop-color="#18c93a"/>' +
				'</linearGradient></defs>' +
				'<circle class="ff-ring__track" cx="75" cy="75" r="54"/>' +
				'<circle class="ff-ring__bar" cx="75" cy="75" r="54" stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '" data-doffset="' + off + '"/>' +
			'</svg>' +
			'<div class="ff-donut__label"><b>' + ratio + '%</b><span>optimizado</span></div>' +
		'</div>';
	}

	function perfTypeBars( byType ) {
		byType = byType || {};
		var names = { 'image/jpeg': 'JPEG', 'image/jpg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP', 'image/avif': 'AVIF', 'image/svg+xml': 'SVG' };
		var keys = Object.keys( byType );
		if ( ! keys.length ) { return '<p class="ff-muted">Sin activos todavía.</p>'; }
		var max = Math.max.apply( null, keys.map( function ( k ) { return byType[ k ]; } ).concat( [ 1 ] ) );
		return keys.map( function ( k ) {
			var w = Math.round( ( byType[ k ] / max ) * 100 );
			return '<div class="ff-pbar"><i>' + h( names[ k ] || k ) + '</i>' +
				'<div class="ff-pbar__track"><span data-grow="' + w + '%" style="width:0"></span></div>' +
				'<b>' + byType[ k ] + '</b></div>';
		} ).join( '' );
	}

	function animatePerf() {
		setTimeout( function () {
			var body = document.getElementById( 'ff-perf-body' );
			if ( ! body ) { return; }
			body.querySelectorAll( '[data-grow]' ).forEach( function ( el ) { el.style.width = el.getAttribute( 'data-grow' ); } );
			body.querySelectorAll( '[data-doffset]' ).forEach( function ( el ) { el.setAttribute( 'stroke-dashoffset', el.getAttribute( 'data-doffset' ) ); } );
		}, 80 );
	}

	/* ============================================================
	 * Vista: IA & SEO
	 * ============================================================ */
	function viewAI( view ) {
		var ai = State.settings.ai || {};
		var mod = State.settings.moderation || {};
		var pro = isPro();
		view.innerHTML = topbar( 'SEO & Textos', 'Generación automática de texto alternativo, títulos y descripciones a partir de la imagen.',
			'<button class="ff-btn" data-action="ai-test">🔌 Probar conexión</button>' ) +
			'<div class="ff-card ff-card--pad-lg ff-mt">' +
				'<div class="ff-ai-note">🔎 FasterFy envía la imagen al proveedor de IA que configures para generar el texto. Los resultados pueden contener errores y conviene revisarlos; no sustituyen el criterio humano. No se usan tus imágenes para entrenar modelos. Recuerda declarar tu proveedor de IA en tu política de privacidad.</div>' +
				'<div class="ff-settings-grid">' +
					'<div class="ff-section-title">Modelo multimodal</div>' +
					toggleField( 'ai.enabled', 'Activar generación de textos', ai.enabled, 'Analiza la imagen y genera texto alternativo, títulos y descripciones automáticamente.' ) +
					field( 'ai.provider', 'Proveedor', selectInput( 'ai.provider', ai.provider, [ [ 'openai', 'OpenAI-compatible' ], [ 'fasterfy_cloud', 'FasterFy Cloud' ] ] ), 'Servicio que analiza las imágenes y redacta los textos. "OpenAI-compatible" funciona con OpenAI, Google Gemini, OpenRouter, Groq y similares.' ) +
					field( 'ai.api_base', 'Endpoint base', textInput( 'ai.api_base', ai.api_base ), 'Dirección del servicio (endpoint). Ej.: https://api.openai.com/v1 o el que indique tu proveedor.' ) +
					field( 'ai.api_key', 'API Key' + ( ai.has_api_key ? ' (configurada ✓)' : '' ), passwordInput( 'ai.api_key', '', ai.has_api_key ? '•••••••• (deja vacío para conservar)' : 'sk-…' ), 'Tu clave privada del proveedor. Se guarda cifrada y nunca se muestra. Déjala vacía para conservar la actual.' ) +
					field( 'ai.vision_model', 'Modelo', textInput( 'ai.vision_model', ai.vision_model ), 'Nombre del modelo que "ve" la imagen. Ej.: gpt-4o-mini (OpenAI) o gemini-2.5-flash (Google).' ) +
					field( 'ai.language', 'Idioma de los textos', textInput( 'ai.language', ai.language ), 'Idioma en el que se generan los textos. Códigos: es (español), en (inglés), fr (francés), etc.' ) +
					( pro ? rangeField( 'ai.temperature', 'Temperatura (anti-alucinación)', ai.temperature, 0, 1, 0.05 ) : '' ) +
					( pro ? rangeField( 'ai.alt_max_length', 'Longitud máx. del Alt Text', ai.alt_max_length, 20, 300, 5 ) : '' ) +

					'<div class="ff-section-title">Generación</div>' +
					toggleField( 'ai.generate_alt', 'Generar Alt Text', ai.generate_alt, 'Inyecta _wp_attachment_image_alt de forma nativa.' ) +
					toggleField( 'ai.generate_title', 'Generar título / leyenda', ai.generate_title, 'Rellena el título y la leyenda del adjunto a partir de lo que muestra la imagen.' ) +
					toggleField( 'ai.hyphenate_title', 'Título con guiones (SEO)', ai.hyphenate_title, 'Separa las palabras del título con guiones. Ej.: Retrato-de-hombre-joven.' ) +
					toggleField( 'ai.generate_description', 'Generar descripción', ai.generate_description, 'Rellena el campo Descripción del adjunto.' ) +
					( pro ? toggleField( 'ai.semantic_rename', 'Renombrado semántico SEO', ai.semantic_rename, 'Renombra el archivo con keywords y actualiza la BD.' ) : '' ) +

					( pro ? '<div class="ff-section-title">Moderación de contenido (Pro)</div>' : '' ) +
					( pro ? toggleField( 'moderation.enabled', 'Moderación NSFW activa', mod.enabled, 'Evalúa cada activo antes de la IA generativa.' ) : '' ) +
					( pro ? toggleField( 'moderation.block_generative', 'Bloquear IA en contenido sensible', mod.block_generative, 'Optimiza técnicamente pero omite la IA generativa.' ) : '' ) +
					( pro ? rangeField( 'moderation.nsfw_threshold', 'Umbral de bloqueo', mod.nsfw_threshold, 0, 1, 0.05 ) : '' ) +
					( pro ? field( 'moderation.fallback_alt', 'Texto alternativo de respaldo', textInput( 'moderation.fallback_alt', mod.fallback_alt ), 'Texto genérico que se asigna a las imágenes marcadas como sensibles (a esas no se les envía al modelo generativo).' ) : '' ) +
				'</div>' +
				( ! pro ? '<p class="ff-muted ff-mt" style="font-size:12px">Cambia a <b>Pro</b> para ajustar temperatura, renombrado semántico y moderación.</p>' : '' ) +
				'<div class="ff-row ff-mt-lg"><button class="ff-btn ff-btn--primary ff-btn--lg" data-action="save-settings">Guardar cambios</button></div>' +
			'</div>';
	}

	/* ============================================================
	 * Vista: Ajustes
	 * ============================================================ */
	function viewSettings( view ) {
		var c = State.settings.conversion || {};
		var t = State.settings.throttling || {};
		var a = State.settings.automation || {};
		var adv = State.settings.advanced || {};
		var ex = State.settings.exclusions || {};

		var pro = isPro();

		view.innerHTML = topbar( 'Ajustes', 'Configura el pipeline de optimización y la automatización.', '' ) +
			'<div class="ff-card ff-card--pad-lg ff-mt">' +
				'<div class="ff-settings-grid">' +
					'<div class="ff-section-title">Conversión y compresión</div>' +
					field( 'conversion.target_format', 'Formato objetivo (JPG/PNG)', selectInput( 'conversion.target_format', c.target_format, [ [ 'webp', 'WebP' ], [ 'avif', 'AVIF' ], [ 'auto', 'Automático (mejor disponible)' ] ] ), 'Formato moderno al que se convierten tus JPG y PNG. AVIF comprime más que WebP; "Automático" elige el mejor que soporte tu servidor.' ) +
					field( 'conversion.png_strategy', 'Estrategia PNG', selectInput( 'conversion.png_strategy', c.png_strategy, [ [ 'lossy', 'Con pérdida (cuantización)' ], [ 'lossless', 'Sin pérdida' ] ] ), 'Cómo comprimir los PNG que no se conviertan: "con pérdida" reduce el número de colores (más ligero); "sin pérdida" los conserva todos.' ) +
					toggleField( 'conversion.png_to_webp', 'Convertir PNG a WebP/AVIF si ahorra más', c.png_to_webp, 'Recomendado: usa el "Formato objetivo" elegido (WebP o AVIF, ambos conservan transparencia). Si no ahorra, intenta comprimir el PNG.' ) +
					rangeField( 'conversion.webp_quality', 'Calidad WebP', c.webp_quality, 1, 100, 1, 'Menor valor = archivos más ligeros. 75–82 es un buen equilibrio.' ) +
					rangeField( 'conversion.avif_quality', 'Calidad AVIF', c.avif_quality, 1, 100, 1, 'Menor valor = archivos mucho más ligeros. Para máximo ahorro, 30–40 (AVIF mantiene buena calidad incluso bajo). Sube el valor solo si notas pérdida visible.' ) +
					( pro ? rangeField( 'conversion.png_max_colors', 'Colores PNG (lossy)', c.png_max_colors, 2, 256, 2 ) : '' ) +
					( pro ? field( 'conversion.max_width', 'Ancho máximo (px, 0=off)', numberInput( 'conversion.max_width', c.max_width ), 'Reduce las imágenes más anchas que este valor (en píxeles). Ideal para fotos enormes de móvil: baja mucho el peso. 0 = no redimensionar.' ) : '' ) +
					toggleField( 'conversion.sanitize_svg', 'Sanitizar SVG', c.sanitize_svg, 'Elimina scripts y metadatos de diseño.' ) +
					toggleField( 'conversion.strip_metadata', 'Eliminar metadatos EXIF', c.strip_metadata, 'Quita datos incrustados como modelo de cámara, ubicación GPS y fecha. Reduce el peso y protege la privacidad.' ) +
					toggleField( 'conversion.keep_original', 'Conservar original como respaldo', c.keep_original, 'Guarda una copia intacta del archivo original para poder revertir la optimización con 1 clic.' ) +

					'<div class="ff-section-title">Automatización</div>' +
					toggleField( 'automation.optimize_on_upload', 'Optimizar al subir', a.optimize_on_upload, 'Comprime y convierte automáticamente cada imagen nueva que subas a la biblioteca.' ) +
					toggleField( 'automation.ai_on_upload', 'Generar textos SEO al subir', a.ai_on_upload, 'Genera automáticamente el texto alternativo, título y descripción de cada imagen nueva. Consume peticiones de tu proveedor de textos.' ) +

					( pro ? '<div class="ff-section-title">Concurrencia y throttling (Pro)</div>' : '' ) +
					( pro ? rangeField( 'throttling.batch_size', 'Tamaño de lote', t.batch_size, 1, 100, 1, 'Cuántas imágenes se procesan por tanda. Si tu proveedor de textos te limita (plan gratuito), baja este número a 1–2.' ) : '' ) +
					( pro ? rangeField( 'throttling.max_concurrency', 'Concurrencia máx.', t.max_concurrency, 1, 50, 1, 'Peticiones simultáneas máximas. Mantenlo bajo (1–3) con planes gratuitos para evitar bloqueos por límite.' ) : '' ) +
					( pro ? rangeField( 'throttling.cooldown_seconds', 'Enfriamiento entre lotes (s)', t.cooldown_seconds, 0, 300, 1, 'Segundos de pausa entre tandas. Súbelo si tu proveedor de textos te limita a menudo.' ) : '' ) +

					( pro ? '<div class="ff-section-title">Exclusiones (Pro)</div>' : '' ) +
					( pro ? field( 'exclusions.directories', 'Directorios excluidos (uno por línea)', textareaInput( 'exclusions.directories', ( ex.directories || [] ).join( '\n' ) ), 'Carpetas dentro de /uploads que NO quieres tocar (una por línea). Ej.: 2023/12. Útil para proteger imágenes ya optimizadas o gestionadas por otro plugin.' ) : '' ) +
					( pro ? field( 'exclusions.attachment_ids', 'IDs excluidos (separados por coma)', textInput( 'exclusions.attachment_ids', ( ex.attachment_ids || [] ).join( ',' ) ), 'IDs de imágenes concretas que quieres excluir del procesamiento (separados por coma). El ID de cada imagen aparece en su ficha de detalle (#123).' ) : '' ) +

					'<div class="ff-section-title">Avanzado</div>' +
					field( 'advanced.log_level', 'Nivel de registro (log)', selectInput( 'advanced.log_level', adv.log_level, [ [ 'debug', 'Debug (todo)' ], [ 'info', 'Info (normal)' ], [ 'warning', 'Warning (avisos)' ], [ 'error', 'Error (solo fallos)' ] ] ), 'Cuánto detalle se guarda en la pestaña Registros. "Info" es lo normal; "Debug" registra todo (para diagnosticar problemas); "Error" solo los fallos.' ) +
					toggleField( 'advanced.prefer_action_scheduler', 'Preferir Action Scheduler', adv.prefer_action_scheduler, 'Si tienes WooCommerce o Action Scheduler instalado, usa ese motor de colas (más robusto para tareas en segundo plano).' ) +
					toggleField( 'advanced.delete_data_on_uninstall', 'Borrar datos al desinstalar', adv.delete_data_on_uninstall, 'Si se activa, al eliminar el plugin se borran también sus ajustes y registros. Déjalo desactivado si podrías reinstalarlo.' ) +
				'</div>' +
				'<div class="ff-section-title" style="margin-top:22px">Copia de seguridad de la configuración</div>' +
				'<div class="ff-backup">' +
					'<button class="ff-btn" data-action="export-settings">⬇ Exportar configuración</button>' +
					'<label class="ff-btn" for="ff-import" style="cursor:pointer">⬆ Importar configuración</label>' +
					'<input type="file" id="ff-import" accept="application/json,.json" hidden>' +
					'<span class="ff-muted" style="font-size:12px;align-self:center">Guarda tus ajustes en un archivo o restáuralos. Útil para replicar la misma configuración en otro sitio. La API Key no se incluye por seguridad.</span>' +
				'</div>' +
				'<div class="ff-row ff-mt-lg">' +
					'<button class="ff-btn ff-btn--primary ff-btn--lg" data-action="save-settings">Guardar cambios</button>' +
					( ! pro ? '<span class="ff-muted">Cambia a <b>Pro</b> para opciones avanzadas.</span>' : '' ) +
				'</div>' +
			'</div>';
	}

	/* ============================================================
	 * Vista: Logs
	 * ============================================================ */
	function viewLogs( view ) {
		view.innerHTML = topbar( 'Registros', 'Trazabilidad del procesamiento, IA y errores.',
			'<button class="ff-btn ff-btn--danger" data-action="clear-logs">🗑 Limpiar</button>' ) +
			'<div class="ff-card"><div id="ff-logs-body"></div></div>';
		loadLogs();
	}

	function renderLogs() {
		var el = document.getElementById( 'ff-logs-body' );
		if ( ! el ) { return; }
		if ( State.logs.loading ) {
			el.innerHTML = '<div class="ff-empty"><span class="ff-spinner"></span> Cargando…</div>';
			return;
		}
		if ( ! State.logs.items.length ) {
			el.innerHTML = '<div class="ff-empty">No hay registros todavía.</div>';
			return;
		}
		var rows = State.logs.items.map( function ( r ) {
			return '<div class="ff-log__row ff-log">' +
				'<span class="ff-muted">' + h( r.created_at ) + '</span>' +
				'<span class="ff-log__lvl ' + r.level + '">' + r.level + '</span>' +
				'<span class="ff-muted">' + h( r.context ) + ( r.attachment_id ? ' #' + r.attachment_id : '' ) + '</span>' +
				'<span>' + h( r.message ) + '</span>' +
			'</div>';
		} ).join( '' );
		var pages = Math.ceil( State.logs.total / 50 );
		el.innerHTML = rows + pagination( State.logs.page, pages, 'logs-page' );
	}

	/* ============================================================
	 * Campos de formulario (helpers)
	 * ============================================================ */
	function field( key, label, input, hint ) {
		var help = hint ? ' <i class="ff-help" title="' + h( hint ) + '">i</i>' : '';
		return '<div class="ff-field"><label>' + h( label ) + help + '</label>' + input +
			( hint ? '<div class="ff-hint">' + h( hint ) + '</div>' : '' ) + '</div>';
	}
	function textInput( key, val ) {
		return '<input type="text" class="ff-input" data-setting="' + key + '" value="' + h( val || '' ) + '">';
	}
	function passwordInput( key, val, ph ) {
		return '<input type="password" class="ff-input" data-setting="' + key + '" value="' + h( val || '' ) + '" placeholder="' + h( ph || '' ) + '" autocomplete="new-password">';
	}
	function numberInput( key, val ) {
		return '<input type="number" class="ff-input" data-setting="' + key + '" value="' + h( val != null ? val : 0 ) + '">';
	}
	function textareaInput( key, val ) {
		return '<textarea class="ff-input" rows="3" data-setting="' + key + '" data-type="lines">' + h( val || '' ) + '</textarea>';
	}
	function selectInput( key, val, options ) {
		var opts = options.map( function ( o ) {
			return '<option value="' + o[ 0 ] + '"' + ( String( val ) === o[ 0 ] ? ' selected' : '' ) + '>' + h( o[ 1 ] ) + '</option>';
		} ).join( '' );
		return '<select class="ff-select" data-setting="' + key + '">' + opts + '</select>';
	}
	function rangeField( key, label, val, min, max, step, hint ) {
		return '<div class="ff-field"><label>' + h( label ) + ' <b data-rangeval="' + key + '" style="color:var(--ff-primary-2)">' + ( val != null ? val : '' ) + '</b></label>' +
			'<input type="range" class="ff-range" data-setting="' + key + '" data-type="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + ( val != null ? val : min ) + '">' +
			( hint ? '<div class="ff-hint">' + h( hint ) + '</div>' : '' ) + '</div>';
	}
	function toggleField( key, label, checked, hint ) {
		return '<div class="ff-field"><label class="ff-toggle">' +
			'<input type="checkbox" data-setting="' + key + '" data-type="bool"' + ( checked ? ' checked' : '' ) + '>' +
			'<span class="ff-toggle__track"></span><span>' + h( label ) + '</span></label>' +
			( hint ? '<div class="ff-hint">' + h( hint ) + '</div>' : '' ) + '</div>';
	}

	/* ============================================================
	 * Recolección y guardado de ajustes
	 * ============================================================ */
	function collectSettings() {
		var out = {};
		document.querySelectorAll( '[data-setting]' ).forEach( function ( el ) {
			var key = el.getAttribute( 'data-setting' );
			var type = el.getAttribute( 'data-type' );
			var val;
			if ( type === 'bool' ) { val = el.checked; }
			else if ( type === 'number' ) { val = parseFloat( el.value ); }
			else if ( type === 'lines' ) { val = el.value.split( '\n' ).map( function ( s ) { return s.trim(); } ).filter( Boolean ); }
			else { val = el.value; }

			// API key vacía => no la enviamos (se conserva la existente).
			if ( key === 'ai.api_key' && val === '' ) { return; }
			// IDs excluidos como array.
			if ( key === 'exclusions.attachment_ids' && typeof val === 'string' ) {
				val = val.split( ',' ).map( function ( s ) { return parseInt( s, 10 ); } ).filter( function ( n ) { return ! isNaN( n ); } );
			}
			setDeep( out, key, val );
		} );
		return out;
	}
	function setDeep( obj, path, val ) {
		var parts = path.split( '.' );
		var cur = obj;
		for ( var i = 0; i < parts.length - 1; i++ ) {
			cur[ parts[ i ] ] = cur[ parts[ i ] ] || {};
			cur = cur[ parts[ i ] ];
		}
		cur[ parts[ parts.length - 1 ] ] = val;
	}

	function saveSettings() {
		var payload = collectSettings();
		Api.post( '/settings', { settings: payload } ).then( function ( res ) {
			State.settings = res.settings;
			toast( 'Ajustes guardados correctamente.', 'success' );
		} ).catch( function ( e ) { toast( 'Error al guardar: ' + e.message, 'error' ); } );
	}

	/** Exporta la configuración actual (sin secretos) a un archivo JSON. */
	function exportSettings() {
		try {
			var copy = JSON.parse( JSON.stringify( State.settings || {} ) );
			if ( copy.ai ) { delete copy.ai.api_key; delete copy.ai.has_api_key; }
			copy._fasterfy_export = { version: DATA.version || '', date: new Date().toISOString() };
			var blob = new Blob( [ JSON.stringify( copy, null, 2 ) ], { type: 'application/json' } );
			var url = URL.createObjectURL( blob );
			var a = document.createElement( 'a' );
			a.href = url;
			a.download = 'fasterfy-config.json';
			document.body.appendChild( a );
			a.click();
			a.remove();
			URL.revokeObjectURL( url );
			toast( 'Configuración exportada.', 'success' );
		} catch ( e ) {
			toast( 'No se pudo exportar: ' + e.message, 'error' );
		}
	}

	/** Importa una configuración desde un archivo JSON y la aplica. */
	function importSettings( file ) {
		var reader = new FileReader();
		reader.onload = function () {
			var obj;
			try {
				obj = JSON.parse( String( reader.result ) );
			} catch ( e ) {
				toast( 'El archivo no es un JSON válido.', 'error' );
				return;
			}
			if ( ! obj || 'object' !== typeof obj ) {
				toast( 'El archivo no contiene una configuración válida.', 'error' );
				return;
			}
			if ( ! window.confirm( '¿Importar esta configuración? Se sobrescribirán tus ajustes actuales. La API Key se conserva.' ) ) {
				return;
			}
			delete obj._fasterfy_export;
			if ( obj.ai ) { delete obj.ai.api_key; delete obj.ai.has_api_key; } // No tocar la clave.
			Api.post( '/settings', { settings: obj } ).then( function ( res ) {
				State.settings = res.settings;
				toast( 'Configuración importada y aplicada.', 'success' );
				renderRoute();
			} ).catch( function ( e ) { toast( 'Error al importar: ' + e.message, 'error' ); } );
		};
		reader.readAsText( file );
	}

	/** Eventos "change" (input de archivo para importar configuración). */
	function onChange( e ) {
		if ( 'ff-import' === e.target.id ) {
			var file = e.target.files && e.target.files[ 0 ];
			if ( file ) { importSettings( file ); }
			e.target.value = '';
		}
	}

	/* ============================================================
	 * Cargadores de datos
	 * ============================================================ */
	function loadSummary() {
		return Api.get( '/summary' ).then( function ( res ) {
			State.summary = res;
			State.queue = res.queue;
			return res;
		} ).catch( function ( e ) { toast( e.message, 'error' ); } );
	}
	function loadMedia() {
		State.media.loading = true;
		renderMediaTable();
		return Api.get( '/media?status=' + State.media.status + '&page=' + State.media.page + '&per_page=24&orderby=' + encodeURIComponent( State.media.orderby ) + '&search=' + encodeURIComponent( State.media.search ) + '&date=' + encodeURIComponent( State.media.date ) )
			.then( function ( res ) {
				State.media.items = res.items;
				State.media.total = res.total;
				State.media.loading = false;
				renderMediaTable();
			} ).catch( function ( e ) { State.media.loading = false; toast( e.message, 'error' ); renderMediaTable(); } );
	}
	function loadLogs() {
		State.logs.loading = true;
		renderLogs();
		return Api.get( '/logs?page=' + State.logs.page + '&per_page=50' ).then( function ( res ) {
			State.logs.items = res.items;
			State.logs.total = res.total;
			State.logs.loading = false;
			renderLogs();
		} ).catch( function ( e ) { State.logs.loading = false; toast( e.message, 'error' ); renderLogs(); } );
	}

	/* ============================================================
	 * Polling de la cola
	 * ============================================================ */
	function startDriving() {
		if ( State.driving ) { return; }
		State.driving = true;
		State.driveErrors = 0;
		driveTick();
	}
	function stopDriving() {
		State.driving = false;
		stopThrottleCountdown();
	}

	/* Cuenta regresiva visible mientras se espera por el rate-limit del proveedor. */
	function startThrottleCountdown( seconds ) {
		stopThrottleCountdown();
		State.throttleLeft = seconds;
		State.throttleTimer = setInterval( function () {
			State.throttleLeft = Math.max( 0, ( State.throttleLeft || 0 ) - 1 );
			var el = document.getElementById( 'ff-throttle' );
			if ( el ) { el.textContent = State.throttleLeft + 's'; }
			if ( State.throttleLeft <= 0 ) { stopThrottleCountdown(); }
		}, 1000 );
	}
	function stopThrottleCountdown() {
		if ( State.throttleTimer ) { clearInterval( State.throttleTimer ); State.throttleTimer = null; }
	}
	function driveTick() {
		if ( ! State.driving ) { return; }
		Api.post( '/queue/run' ).then( function ( res ) {
			State.driveErrors = 0;
			State.queue = res.queue;
			if ( State.summary ) { State.summary.library = res.library; State.summary.queue = res.queue; }
			updateQueueViews();
			if ( 'running' === res.queue.status ) {
				// Si el proveedor de IA pidió esperar (rate-limit), respetamos ese
				// tiempo antes del próximo lote. La cola se auto-regula y termina sola.
				var retry = parseInt( res.queue.retry_after, 10 ) || 0;
				if ( retry > 0 ) {
					var wait = Math.min( 60, retry );
					if ( ! State.throttleNotified ) {
						State.throttleNotified = true;
						toast( 'Ritmo ajustado al límite del proveedor de IA. El proceso continúa solo…', 'info' );
					}
					startThrottleCountdown( wait );
					setTimeout( driveTick, wait * 1000 );
				} else {
					State.throttleNotified = false;
					stopThrottleCountdown();
					setTimeout( driveTick, 500 );
				}
			} else {
				stopDriving();
				if ( 'completed' === res.queue.status ) { closeProcessingModal(); toast( 'Procesamiento completado 🎉', 'success' ); }
				if ( 'exhausted' === res.queue.status ) { closeProcessingModal(); toast( 'Cola pausada: cuota de créditos agotada.', 'info' ); }
				if ( 'paused' === res.queue.status && res.queue.notice ) { closeProcessingModal(); toast( res.queue.notice, 'error' ); }
				if ( 'media' === State.route ) { loadMedia(); }
				if ( 'dashboard' === State.route ) { loadSummary().then( renderDashboardBody ); }
			}
		} ).catch( function ( e ) {
			State.driveErrors = ( State.driveErrors || 0 ) + 1;
			if ( State.driveErrors > 3 ) {
				stopDriving();
				toast( 'Procesamiento detenido por errores repetidos: ' + e.message, 'error' );
			} else {
				setTimeout( driveTick, 2500 );
			}
		} );
	}

	/* ============================================================
	 * Acciones (event delegation)
	 * ============================================================ */
	/**
	 * Ejecuta una petición por cada id, en secuencia, con aviso de progreso.
	 * `delay` (ms) añade una pausa entre peticiones para no saturar el proveedor
	 * de IA (rate limits en planes gratuitos). Reintenta una vez tras un fallo.
	 */
	function runSequential( ids, makeReq, doneLabel, delay ) {
		delay = delay || 0;
		var total = ids.length;
		var ok = 0;
		var failed = 0;
		function next() {
			if ( ! ids.length ) {
				seqProgress( total, total, doneLabel ); // cierra el indicador.
				var msg = doneLabel + ': ' + ok + '/' + total + ' ✓';
				if ( failed ) { msg += ' · ' + failed + ' pendiente(s), usa "Reintentar" si hace falta'; }
				toast( msg, failed ? 'info' : 'success' );
				State.media.selected = [];
				loadMedia();
				return;
			}
			seqProgress( ok + failed, total, doneLabel );
			var id = ids.shift();
			makeReq( id )
				.then( function () { ok++; } )
				.catch( function () { failed++; } )
				.then( function () { delay > 0 ? setTimeout( next, delay ) : next(); } );
		}
		next();
	}

	/**
	 * Indicador flotante de progreso para acciones por selección. Muestra
	 * "n / total" con barra, de forma persistente hasta terminar.
	 */
	function seqProgress( done, total, label ) {
		var el = document.getElementById( 'ff-seqprog' );
		if ( done >= total ) { if ( el ) { el.remove(); } return; }
		// Se ubica dentro de la misma pila de notificaciones (arriba-derecha) para
		// mantener consistencia visual con los toasts.
		var wrap = document.querySelector( '.ff-toasts' );
		if ( ! wrap ) {
			wrap = document.createElement( 'div' );
			wrap.className = 'ff-toasts';
			document.body.appendChild( wrap );
		}
		if ( ! el ) {
			el = document.createElement( 'div' );
			el.id = 'ff-seqprog';
			el.className = 'ff-seqprog';
			wrap.insertBefore( el, wrap.firstChild );
		}
		var p = total > 0 ? Math.round( ( done / total ) * 100 ) : 0;
		el.innerHTML =
			'<div class="ff-seqprog__head"><span class="ff-spinner"></span><span>' + h( label || 'Procesando' ) + '</span><b>' + done + ' / ' + total + '</b></div>' +
			'<div class="ff-seqprog__bar"><span style="width:' + p + '%"></span></div>';
	}

	function onClick( e ) {
		var nav = e.target.closest( '[data-route]' );
		if ( nav ) { State.route = nav.getAttribute( 'data-route' ); renderShell(); return; }

		var actionEl = e.target.closest( '[data-action]' );
		var _act = actionEl ? actionEl.getAttribute( 'data-action' ) : '';
		// Cierra el panel de notificaciones al hacer clic fuera de él.
		if ( State.notifOpen && ! e.target.closest( '#ff-notifpanel' ) && 'notif-toggle' !== _act ) {
			State.notifOpen = false;
			renderNotifPanel();
		}
		if ( ! actionEl ) { return; }
		var action = _act;

		switch ( action ) {
			case 'mode':
				var modeBtn = e.target.closest( '[data-mode]' );
				if ( modeBtn ) {
					State.settings.mode = modeBtn.getAttribute( 'data-mode' );
					Api.post( '/settings', { settings: { mode: State.settings.mode } } ).then( function ( r ) { State.settings = r.settings; } );
					renderShell();
				}
				break;
			case 'theme':
				State.theme = State.theme === 'dark' ? 'light' : 'dark';
				localStorage.setItem( 'fasterfy_theme', State.theme );
				renderShell();
				break;
			case 'notif-toggle':
				State.notifOpen = ! State.notifOpen;
				if ( State.notifOpen ) { State.notifUnread = 0; refreshBellBadge(); }
				renderNotifPanel();
				break;
			case 'notif-clear':
				State.notifications = [];
				State.notifUnread = 0;
				refreshBellBadge();
				renderNotifPanel();
				break;
			case 'start-queue':
				var mode = actionEl.getAttribute( 'data-mode' ) || 'optimize';
				if ( 'rollback' === mode && ! window.confirm( '¿Revertir TODA la biblioteca a las imágenes originales? Esto deshace la optimización en todas las que tengan respaldo.' ) ) {
					break;
				}
				Api.post( '/queue/start', { mode: mode } ).then( function ( res ) {
					State.queue = res.queue; State.driveErrors = 0;
					if ( 'rollback' !== mode ) { showProcessingModal( mode ); }
					updateQueueViews();
					startDriving();
				} ).catch( function ( er ) { toast( er.message, 'error' ); } );
				break;
			case 'pause-queue':
				Api.post( '/queue/pause' ).then( function ( res ) { State.queue = res.queue; stopDriving(); updateQueueViews(); toast( 'Cola pausada.', 'info' ); } );
				break;
			case 'resume-queue':
				Api.post( '/queue/resume' ).then( function ( res ) { State.queue = res.queue; startDriving(); updateQueueViews(); toast( 'Cola reanudada.', 'success' ); } );
				break;
			case 'cancel-queue':
				Api.post( '/queue/cancel' ).then( function ( res ) { State.queue = res.queue; stopDriving(); updateQueueViews(); toast( 'Cola detenida.', 'info' ); } );
				break;
			case 'media-tab':
				var statusBtn = e.target.closest( '[data-status]' );
				if ( statusBtn ) { State.media.status = statusBtn.getAttribute( 'data-status' ); State.media.page = 1; renderRoute(); }
				break;
			case 'media-view':
				var viewBtn = e.target.closest( '[data-view]' );
				if ( viewBtn ) {
					State.media.view = viewBtn.getAttribute( 'data-view' );
					try { localStorage.setItem( 'fasterfy_media_view', State.media.view ); } catch ( err ) {}
					renderRoute();
				}
				break;
			case 'media-page':
				State.media.page = parseInt( actionEl.getAttribute( 'data-page' ), 10 ); loadMedia();
				break;
			case 'logs-page':
				State.logs.page = parseInt( actionEl.getAttribute( 'data-page' ), 10 ); loadLogs();
				break;
			case 'optimize-one':
				itemAction( actionEl, '/optimize', { id: +actionEl.getAttribute( 'data-id' ), mode: 'optimize' }, 'Optimizado' );
				break;
			case 'ai-one':
				itemAction( actionEl, '/ai/item', { id: +actionEl.getAttribute( 'data-id' ) }, 'Texto SEO generado' );
				break;
			case 'rollback-one':
				itemAction( actionEl, '/rollback', { id: +actionEl.getAttribute( 'data-id' ) }, 'Revertido al original' );
				break;
			case 'card-select':
				var pickId = +actionEl.getAttribute( 'data-id' );
				var pickIdx = State.media.selected.indexOf( pickId );
				if ( pickIdx >= 0 ) { State.media.selected.splice( pickIdx, 1 ); }
				else { State.media.selected.push( pickId ); }
				renderMediaTable();
				break;
			case 'card-detail':
				openDetail( +actionEl.getAttribute( 'data-id' ) );
				break;
			case 'select':
				var cb = e.target.closest( '[data-action="select"]' );
				if ( cb ) {
					var sid = +cb.getAttribute( 'data-id' );
					var idx = State.media.selected.indexOf( sid );
					if ( cb.checked && idx < 0 ) { State.media.selected.push( sid ); }
					else if ( ! cb.checked && idx >= 0 ) { State.media.selected.splice( idx, 1 ); }
					renderMediaTable();
				}
				break;
			case 'sel-clear':
				State.media.selected = [];
				renderMediaTable();
				break;
			case 'detail':
				openDetail( +actionEl.getAttribute( 'data-id' ) );
				break;
			case 'detail-close':
				closeDetail();
				break;
			case 'proc-close':
				closeProcessingModal();
				break;
			case 'detail-prev':
				detailNav( -1 );
				break;
			case 'detail-next':
				detailNav( 1 );
				break;
			case 'hero-dot':
				heroGo( parseInt( actionEl.getAttribute( 'data-i' ), 10 ) );
				if ( State.heroTimer ) { clearInterval( State.heroTimer ); startHero(); }
				break;
			case 'select-all':
				if ( allPageSelected() ) {
					var pidsOff = State.media.items.map( function ( it ) { return it.id; } );
					State.media.selected = State.media.selected.filter( function ( id ) { return pidsOff.indexOf( id ) < 0; } );
				} else {
					State.media.items.forEach( function ( it ) { if ( State.media.selected.indexOf( it.id ) < 0 ) { State.media.selected.push( it.id ); } } );
				}
				renderMediaTable();
				break;
			case 'sel-optimize':
				runSequential( State.media.selected.slice(), function ( id ) { return Api.post( '/optimize', { id: id, mode: 'optimize' } ); }, 'Optimizadas' );
				break;
			case 'sel-ai':
				// Pausa de 1.2 s entre imágenes para respetar rate limits de IA.
				runSequential( State.media.selected.slice(), function ( id ) { return Api.post( '/ai/item', { id: id } ); }, 'Textos generados', 1200 );
				break;
			case 'sel-rollback':
				runSequential( State.media.selected.slice(), function ( id ) { return Api.post( '/rollback', { id: id } ); }, 'Revertidas' );
				break;
			case 'save-settings':
				saveSettings();
				break;
			case 'export-settings':
				exportSettings();
				break;
			case 'clear-logs':
				Api.del( '/logs' ).then( function () { State.logs.page = 1; loadLogs(); toast( 'Registros limpiados.', 'success' ); } );
				break;
			case 'ai-reset-failed':
				Api.post( '/ai/reset-failed' ).then( function ( res ) {
					var n = res.reset || 0;
					if ( n > 0 ) {
						toast( n + ' imagen(es) reiniciada(s). Iniciando reintento…', 'success' );
						// Relanza la generación de IA para toda la biblioteca pendiente.
						Api.post( '/queue/start', { mode: 'ai' } ).then( function ( r ) {
							State.queue = r.queue; State.driveErrors = 0; updateQueueViews(); startDriving();
						} );
					} else {
						toast( 'No hay imágenes con IA en error.', 'info' );
					}
				} ).catch( function ( er ) { toast( er.message, 'error' ); } );
				break;
			case 'ai-test':
				actionEl.innerHTML = '<span class="ff-spinner"></span> Probando…';
				Api.post( '/ai/test' ).then( function ( res ) {
					actionEl.innerHTML = '🔌 Probar conexión';
					toast( res.health.message, res.health.ok ? 'success' : 'error' );
				} ).catch( function ( er ) { actionEl.innerHTML = '🔌 Probar conexión'; toast( er.message, 'error' ); } );
				break;
		}
	}

	function itemAction( btn, path, body, okMsg ) {
		var original = btn.innerHTML;
		btn.innerHTML = '<span class="ff-spinner"></span>';
		btn.disabled = true;
		var id = body && body.id;
		var detailOpen = !! document.getElementById( 'ff-detail' );
		Api.post( path, body ).then( function () {
			toast( okMsg, 'success' );
			if ( 'media' === State.route ) { loadMedia(); }
			// Si la ficha de detalle está abierta, la recargamos para mostrar los
			// textos/estado nuevos y, de paso, liberar el botón (se re-renderiza).
			if ( detailOpen && id ) {
				openDetail( id );
			} else {
				btn.innerHTML = original;
				btn.disabled = false;
			}
		} ).catch( function ( e ) {
			btn.innerHTML = original; btn.disabled = false;
			toast( e.message, 'error' );
		} );
	}

	function onInput( e ) {
		var el = e.target;
		if ( el.classList.contains( 'ff-range' ) ) {
			var key = el.getAttribute( 'data-setting' );
			var label = document.querySelector( '[data-rangeval="' + key + '"]' );
			if ( label ) { label.textContent = el.value; }
		}
		if ( 'ff-search' === el.id ) {
			clearTimeout( State._searchTimer );
			State._searchTimer = setTimeout( function () {
				State.media.search = el.value.trim();
				State.media.page = 1;
				loadMedia();
			}, 450 );
		}
		if ( 'ff-orderby' === el.id ) {
			State.media.orderby = el.value;
			State.media.page = 1;
			loadMedia();
		}
		if ( 'ff-datefilter' === el.id ) {
			State.media.date = el.value;
			State.media.page = 1;
			loadMedia();
		}
	}

	/* ============================================================
	 * Init
	 * ============================================================ */
	/** Atajos de teclado: flechas para navegar la ficha, Esc para cerrar. */
	function onKeydown( e ) {
		if ( ! document.getElementById( 'ff-detail' ) ) { return; }
		if ( 'ArrowLeft' === e.key ) { e.preventDefault(); detailNav( -1 ); }
		else if ( 'ArrowRight' === e.key ) { e.preventDefault(); detailNav( 1 ); }
		else if ( 'Escape' === e.key ) { closeDetail(); }
	}

	function init() {
		var app = document.getElementById( 'fasterfy-app' );
		if ( ! app ) { return; }
		app.addEventListener( 'click', onClick );
		app.addEventListener( 'input', onInput );
		app.addEventListener( 'change', onChange );
		document.addEventListener( 'keydown', onKeydown );
		// Al volver a la pestaña, refresca el estado y reanuda el avance si la
		// cola sigue en marcha (los navegadores "congelan" los timers en pestañas
		// de fondo, así que retomamos al recuperar el foco).
		document.addEventListener( 'visibilitychange', function () {
			if ( document.hidden ) { return; }
			Api.get( '/queue/status' ).then( function ( res ) {
				State.queue = res.queue;
				if ( State.summary ) { State.summary.library = res.library; State.summary.queue = res.queue; }
				updateQueueViews();
				if ( 'running' === res.queue.status ) { startDriving(); }
			} ).catch( function () {} );
		} );
		renderShell();
		// Si hay una cola en marcha al cargar, arranca el polling.
		loadSummary().then( function ( res ) {
			if ( res && res.queue && res.queue.status === 'running' ) { startDriving(); }
			renderDashboardBody();
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
