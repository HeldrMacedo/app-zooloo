import * as React from 'react';

import { ZoolooPrinterViewProps } from './ZoolooPrinter.types';

export default function ZoolooPrinterView(props: ZoolooPrinterViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
