import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import RecuperarEmailScreen from './src/screens/RecuperarEmailScreen';
import RecuperarCodigoScreen from './src/screens/RecuperarCodigoScreen';
import RedefinirSenhaScreen from './src/screens/RedefinirSenhaScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#f5f5f5' } }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RecuperarEmail" component={RecuperarEmailScreen} />
        <Stack.Screen name="RecuperarCodigo" component={RecuperarCodigoScreen} />
        <Stack.Screen name="RedefinirSenha" component={RedefinirSenhaScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
