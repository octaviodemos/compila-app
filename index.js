import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './src/widgets/widget-task-handler';

// Mantém o roteamento do Expo Router como ponto de entrada do app.
import 'expo-router/entry';

// Registra o handler que renderiza/atualiza o widget na tela inicial.
registerWidgetTaskHandler(widgetTaskHandler);
