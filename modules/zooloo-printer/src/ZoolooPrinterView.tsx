import { requireNativeView } from 'expo';
import * as React from 'react';

import { ZoolooPrinterViewProps } from './ZoolooPrinter.types';

const NativeView: React.ComponentType<ZoolooPrinterViewProps> =
  requireNativeView('ZoolooPrinter');

export default function ZoolooPrinterView(props: ZoolooPrinterViewProps) {
  return <NativeView {...props} />;
}
