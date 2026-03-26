import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-js-api';
// centers the map to Canada by default
const DEFAULT_CENTER = { lat: 56.1304, lng: -106.3468 }; 
const DEFAULT_ZOOM = 11;

let googleMapsLoaderPromise;

function loadGoogleMapsApi(apiKey) {
	if (!apiKey) {
		return Promise.reject(new Error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your web app environment.'));
	}

	if (window.google?.maps) {
		return Promise.resolve(window.google.maps);
	}

	if (googleMapsLoaderPromise) {
		return googleMapsLoaderPromise;
	}

	googleMapsLoaderPromise = new Promise((resolve, reject) => {
		const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
		if (existing) {
			existing.addEventListener('load', () => resolve(window.google.maps));
			existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script.')));
			return;
		}

		const script = document.createElement('script');
		script.id = GOOGLE_MAPS_SCRIPT_ID;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve(window.google.maps);
		script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
		document.head.appendChild(script);
	});

	return googleMapsLoaderPromise;
}

function normalizeCountry(value) {
	return String(value || '').trim().toLowerCase();
}

function isLikelyPostalCode(postalCode, countryCode) {
	const normalizedCountry = normalizeCountry(countryCode);
	const code = String(postalCode || '').trim();

	if (!code) return false;

	if (normalizedCountry === 'ca' || normalizedCountry === 'canada') {
		return /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(code);
	}

	if (normalizedCountry === 'us' || normalizedCountry === 'usa' || normalizedCountry === 'united states') {
		return /^\d{5}(-\d{4})?$/.test(code);
	}

	return code.length >= 3;
}

function getCountryRestriction(countryCode) {
	const normalizedCountry = normalizeCountry(countryCode);
	if (normalizedCountry === 'canada') return 'ca';
	if (normalizedCountry === 'usa' || normalizedCountry === 'united states') return 'us';
	return normalizedCountry || undefined;
}

export default function GoogleMapSelector({
	initializeCountryBound = 'ca',
	postalCodeToPin = '',
	onLocationPinned,
}) {
	const mapElementRef = useRef(null);
	const mapRef = useRef(null);
	const markerRef = useRef(null);
	const geocoderRef = useRef(null);
	const lastPostalCodeRef = useRef('');

	const [isLoadingMap, setIsLoadingMap] = useState(true);
	const [mapLoadError, setMapLoadError] = useState('');
	const [pinError, setPinError] = useState('');
	const [resolvedAddress, setResolvedAddress] = useState('');

	const apiKey = useMemo(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', []);
	const restrictionCountry = useMemo(
		() => getCountryRestriction(initializeCountryBound),
		[initializeCountryBound],
	);

	const emitResolvedAddress = (address, position) => {
		if (typeof onLocationPinned === 'function') {
			onLocationPinned(address, {
				lat: position.lat(),
				lng: position.lng(),
			});
		}
	};

	const reverseGeocodeAndEmit = (position) => {
		if (!geocoderRef.current) return;

		geocoderRef.current.geocode({ location: position }, (results, status) => {
			if (status === 'OK' && results && results.length > 0) {
				const fullAddress = results[0].formatted_address;
				setResolvedAddress(fullAddress);
				setPinError('');
				emitResolvedAddress(fullAddress, position);
				return;
			}

			setPinError('Unable to resolve a complete address for the selected location.');
		});
	};

	useEffect(() => {
		let isMounted = true;

		async function initializeMap() {
			try {
				setIsLoadingMap(true);
				setMapLoadError('');

				const maps = await loadGoogleMapsApi(apiKey);
				if (!isMounted || !mapElementRef.current) return;

				const map = new maps.Map(mapElementRef.current, {
					center: DEFAULT_CENTER,
					zoom: DEFAULT_ZOOM,
					mapTypeControl: false,
					streetViewControl: false,
					fullscreenControl: false,
				});

				const marker = new maps.Marker({
					map,
					position: DEFAULT_CENTER,
					draggable: true,
					animation: maps.Animation.DROP,
				});

				const geocoder = new maps.Geocoder();

				marker.addListener('dragend', () => {
					const nextPosition = marker.getPosition();
					if (!nextPosition) return;
					reverseGeocodeAndEmit(nextPosition);
				});

				mapRef.current = map;
				markerRef.current = marker;
				geocoderRef.current = geocoder;

				geocoder.geocode({
					address: initializeCountryBound,
					region: restrictionCountry,
				}, (results, status) => {
					if (status === 'OK' && results?.[0]?.geometry?.viewport) {
						map.fitBounds(results[0].geometry.viewport);
						marker.setPosition(results[0].geometry.location);
					}
				});
			} catch (error) {
				setMapLoadError(error.message || 'Map failed to load.');
			} finally {
				if (isMounted) {
					setIsLoadingMap(false);
				}
			}
		}

		initializeMap();

		return () => {
			isMounted = false;
		};
	}, [apiKey, initializeCountryBound, restrictionCountry]);

	useEffect(() => {
		const map = mapRef.current;
		const marker = markerRef.current;
		const geocoder = geocoderRef.current;
		const postalCode = String(postalCodeToPin || '').trim();

		if (!map || !marker || !geocoder) return;

		if (!postalCode) {
			lastPostalCodeRef.current = '';
			setPinError('');
			return;
		}

		if (postalCode === lastPostalCodeRef.current) return;
		lastPostalCodeRef.current = postalCode;

		if (!isLikelyPostalCode(postalCode, restrictionCountry)) {
			setPinError('Invalid postal code. Please enter a valid postal code to pin location.');
			return;
		}

		setPinError('');

		geocoder.geocode({
			address: postalCode,
			componentRestrictions: restrictionCountry ? { country: restrictionCountry } : undefined,
		}, (results, status) => {
			if (status !== 'OK' || !results || results.length === 0) {
				setPinError('Could not find a location for that postal code.');
				return;
			}

			const location = results[0].geometry.location;
			const fullAddress = results[0].formatted_address;

			marker.setPosition(location);
			map.panTo(location);
			map.setZoom(14);

			setResolvedAddress(fullAddress);
			emitResolvedAddress(fullAddress, location);
		});
	}, [postalCodeToPin, restrictionCountry]);

	return (
		<div className="h-full w-full rounded-lg border border-gray-200 bg-white p-2">
			<div className="relative h-full w-full overflow-hidden rounded-md">
				{isLoadingMap && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
						<div className="flex items-center gap-2 text-sm font-medium text-slate-600">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading map...
						</div>
					</div>
				)}

				{mapLoadError && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-rose-50/95 p-3 text-center">
						<div className="space-y-1 text-xs text-rose-700">
							<div className="mx-auto flex w-fit items-center gap-1 font-semibold">
								<AlertCircle className="h-4 w-4" />
								Unable to load Google Map
							</div>
							<p>{mapLoadError}</p>
						</div>
					</div>
				)}

				<div ref={mapElementRef} className="h-full w-full" />

				{!mapLoadError && (
					<div className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-md bg-white/90 px-2 py-1 text-[10px] text-slate-600 shadow-sm">
						<div className="flex items-center gap-1 font-semibold text-slate-700">
							<MapPin className="h-3 w-3 text-teal-600" />
							Pin is draggable
						</div>
						{resolvedAddress && <p className="truncate">{resolvedAddress}</p>}
					</div>
				)}
			</div>

			{pinError && (
				<p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-rose-600">
					<AlertCircle className="h-3 w-3" />
					{pinError}
				</p>
			)}
		</div>
	);
}
