import * as React from 'react';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { Box, CircularProgress, Fab, Paper, Stack, Typography } from '@mui/material';

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GMAP_API || '',
    libraries: ['places'],
  });

  const location = useCurrentLocation();

  React.useEffect(() => {
    if (location) {
      setCenter({
        lat: location?.coords.latitude,
        lng: location?.coords.longitude,
      });
    }
  }, [location]);

  const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: location?.coords.latitude || 0,
    lng: location?.coords.longitude || 0,
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [directionResponse, setDirectionResponse] = React.useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = React.useState<string>('');
  const [duration, setDuration] = React.useState<string>('');

  const originRef = React.useRef<HTMLInputElement | null>(null);
  const destinationRef = React.useRef<HTMLInputElement | null>(null);

  const calculateRoute = async () => {
    if (originRef.current?.value === '' || destinationRef.current?.value === '') {
      // Origin or destination is not set.
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originRef?.current?.value || '',
        destination: destinationRef?.current?.value || '',
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirectionResponse(result);
          setDistance(result?.routes[0].legs[0].distance?.text || '');
          setDuration(result?.routes[0].legs[0].duration?.text || '');
        } else {
          console.error(`error fetching directions ${result}`);
        }
      },
    );
  };

  const clearRoute = () => {
    setDirectionResponse(null);
    setDistance('');
    setDuration('');
    setCenter({
      lat: location?.coords.latitude || 0,
      lng: location?.coords.longitude || 0,
    });
    // Reset the input values only if the refs are defined
    if (originRef.current && destinationRef.current) {
      originRef.current.value = '';
      destinationRef.current.value = '';
    }
  };

  if (!isLoaded)
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
        }}
      >
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </Box>
    );

  return (
    <Box>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{
          position: 'absolute',
          height: '100vh',
          width: '100%',
        }}
        options={{
          disableDefaultUI: true,
        }}
        onLoad={(map) => {
          setMap(map);

          new window.google.maps.Marker({
            position: center,
            map,
          });
        }}
      >
        {directionResponse !== null && <DirectionsRenderer directions={directionResponse} />}
      </GoogleMap>

      <Paper
        sx={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          width: 'calc(100% - 2rem)',
          maxWidth: '400px',
          padding: '1rem',
        }}
      >
        <Stack gap={2}>
          <Autocomplete
            onLoad={(autocomplete) => console.log('autocomplete: ', autocomplete)}
            onPlaceChanged={() => console.log('place changed')}
          >
            <input
              type="text"
              placeholder="Current Location"
              ref={originRef}
              style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `100%`,
                height: `32px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipses`,
              }}
            />
          </Autocomplete>

          <Autocomplete
            onLoad={(autocomplete) => console.log('autocomplete: ', autocomplete)}
            onPlaceChanged={() => console.log('place changed')}
          >
            <input
              type="text"
              placeholder="Destination"
              ref={destinationRef}
              style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `100%`,
                height: `32px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipses`,
              }}
            />
          </Autocomplete>

          <button onClick={calculateRoute}>Calculate Route</button>
          <button onClick={clearRoute}>Clear Route</button>

          {directionResponse && (
            <Stack gap={1}>
              <Typography>Distance: {distance}</Typography>
              <Typography>Duration: {duration}</Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Fab
        sx={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
        }}
        variant="extended"
        color="primary"
        aria-label="re-center"
        onClick={() => map && map.panTo(center)}
      >
        Re-center
      </Fab>
    </Box>
  );
}

const useCurrentLocation = () => {
  const [location, setLocation] = React.useState<GeolocationPosition | null>(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation(position);
    });
  }, []);

  return location;
};

export default App;
