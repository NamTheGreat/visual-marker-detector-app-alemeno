import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'camera',
};

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ 
          title: 'Detection Results',
          headerStyle: { backgroundColor: '#FFF' },
          headerTitleStyle: { color: '#000' },
        }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
