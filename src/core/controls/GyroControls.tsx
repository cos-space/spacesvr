import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";
import {
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFrame, useThree } from "react-three-fiber";
import { Quaternion, Vector2, Vector3 } from "three";
import { config, useSpring } from "react-spring";
import {
  Touch,
  DefaultTouch,
  getCurrentTouch,
  tappedNipple,
} from "../utils/touch";
import { getSpringValues } from "../utils/spring";

const ALPHA_SENSITIVITY = 0.008;

type GyroControlsProps = {
  fallback: ReactNode;
};

/**
 *
 * Gyro controls uses device orientation controls from three js, if applicable.
 * A required fallback component will be used in the place of the gyroscope
 * controls until they are accepted and in use.
 *
 * Some code sampled from TouchFPSCamera.ts
 *
 * @param props
 * @constructor
 */
export const GyroControls = (props: GyroControlsProps) => {
  const { fallback } = props;

  const { camera } = useThree();

  const [controls, setControls] = useState<DeviceOrientationControls>();
  const [enableGyro, setEnableGyro] = useState(false);

  // dragging for y axis offset
  const touchStartPos = useRef<Touch>(DefaultTouch);
  const currentOffset = useRef(0);
  const [spring, setSpring] = useSpring(() => ({
    a: [0],
    config: { ...config.default, precision: 0.001 },
  }));

  // try to prompt user for device controls
  useEffect(() => {
    if (!controls) {
      const func = () => {
        const cont = new DeviceOrientationControls(camera);
        cont.enabled = false; // set to disabled in case they're not working yet
        setControls(cont);
      };
      window.addEventListener("click", func);

      return () => {
        window.removeEventListener("click", func);
      };
    }
  }, [controls]);

  useFrame(() => {
    if (controls && !enableGyro) {
      // check if an event has been received yet
      if (Object.keys(controls.deviceOrientation).length !== 0) {
        setEnableGyro(true);
        controls.enabled = true;
      }
    }

    if (controls) {
      const [a] = getSpringValues(spring);
      controls.alphaOffset = -a * ALPHA_SENSITIVITY;
      controls.update();
    }
  });

  // touch move scripts
  const onTouchStart = (ev: TouchEvent) => {
    if (touchStartPos.current.id !== -1) {
      return;
    }

    if (tappedNipple(ev)) {
      touchStartPos.current = DefaultTouch;
      return;
    }

    // get last in list (most recent touch) to not confuse with movement
    const touchIndex = ev.touches.length - 1;
    const { clientX, clientY, identifier: id } = ev.touches[touchIndex];

    touchStartPos.current = { pos: new Vector2(clientX, clientY), id };
  };

  const onTouchMove = (ev: TouchEvent) => {
    const touch = getCurrentTouch(touchStartPos.current.id, ev.touches);

    if (!touch) {
      return;
    }

    const extraOffset = touch.clientX - touchStartPos.current.pos.x;
    setSpring({ a: [currentOffset.current + extraOffset] });
  };
  const onTouchEnd = (ev: TouchEvent) => {
    const touch = getCurrentTouch(touchStartPos.current.id, ev.changedTouches);

    if (!touch) {
      return;
    }

    const finalOffset = touch.clientX - touchStartPos.current.pos.x;
    setSpring({ a: [currentOffset.current + finalOffset] });
    currentOffset.current += finalOffset;
    touchStartPos.current.id = -1;
  };

  // register touch events
  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (!enableGyro) {
    return <>{fallback}</>;
  }

  return null;
};
