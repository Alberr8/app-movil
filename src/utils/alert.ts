import { Alert, Platform } from 'react-native';

/** React Native's Alert has no web implementation — it silently no-ops there. */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
