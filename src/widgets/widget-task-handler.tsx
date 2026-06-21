import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { StreakWidget } from './StreakWidget';
import { readWidgetStreak } from './widgetStorage';

const nameToWidget = {
  // Deve casar com o "name" do widget em app.json.
  Streak: StreakWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget] ??
    StreakWidget;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': {
      const { sequencia, resolvidoHoje, estadoForcado } =
        await readWidgetStreak();
      props.renderWidget(
        <Widget
          sequencia={sequencia}
          resolvidoHoje={resolvidoHoje}
          estadoForcado={estadoForcado ?? undefined}
          width={widgetInfo.width}
          height={widgetInfo.height}
        />
      );
      break;
    }

    default:
      break;
  }
}
