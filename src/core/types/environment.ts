import { ProviderProps } from "@react-three/cannon/dist/Provider";
import { ContainerProps } from "react-three-fiber/targets/shared/web/ResizeContainer";
import { MutableRefObject, ReactNode } from "react";

export enum Environment {
  STANDARD,
  KEYFRAME,
  PORTAL,
}

export type EnvironmentProps = {
  children: ReactNode;
  canvasProps?: Partial<ContainerProps>;
  physicsProps?: Partial<ProviderProps>;
};

export interface EnvironmentState {
  paused: boolean;
  device: DeviceState;
  setDevice: (d: Device) => void;
  setPaused: (p: boolean, overlay?: string) => void;
  overlay: string | null;
  container: HTMLDivElement | null;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  events: EnvironmentEvent[];
  addEvent: (name: string, callback: (...args: any[]) => void) => void;
}

export interface EnvironmentEvent {
  name: string;
  callback: (...args: any[]) => void;
}

export type Device = "desktop" | "mobile" | "xr";

export type DeviceState = {
  xr: boolean;
  mobile: boolean;
  desktop: boolean;
};
