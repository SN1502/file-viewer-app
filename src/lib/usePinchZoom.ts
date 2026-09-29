import { useEffect, useRef } from 'react';

export interface PinchHandlers {
  /** While pinching. `scale` is relative to the start of the gesture. */
  onPinch(scale: number, originX: number, originY: number): void;
  /** Once, when the fingers lift. */
  onPinchEnd(scale: number, originX: number, originY: number): void;
  onDoubleTap?(x: number, y: number): void;
}

/**
 * Two-finger pinch, double-tap and Ctrl+wheel / trackpad-pinch zoom on a scroll
 * container. Coordinates are relative to the container's visible box.
 */
export function usePinchZoom(element: HTMLElement | null, handlers: PinchHandlers): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!element) return;
    const el = element;

    let pinching = false;
    let startDistance = 1;
    let scale = 1;
    let originX = 0;
    let originY = 0;
    let frame = 0;
    let tap: { time: number; x: number; y: number } | null = null;
    let lastTap = { time: 0, x: 0, y: 0 };
    let wheelScale = 1;
    let wheelTimer = 0;

    const local = (clientX: number, clientY: number): [number, number] => {
      const rect = el.getBoundingClientRect();
      return [clientX - rect.left, clientY - rect.top];
    };
    const distance = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY) || 1;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        pinching = true;
        tap = null;
        scale = 1;
        startDistance = distance(event.touches);
        [originX, originY] = local(
          (event.touches[0].clientX + event.touches[1].clientX) / 2,
          (event.touches[0].clientY + event.touches[1].clientY) / 2,
        );
      } else if (event.touches.length === 1 && !pinching) {
        tap = { time: event.timeStamp, x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (pinching && event.touches.length === 2) {
        event.preventDefault();
        scale = distance(event.touches) / startDistance;
        if (!frame) {
          frame = requestAnimationFrame(() => {
            frame = 0;
            handlersRef.current.onPinch(scale, originX, originY);
          });
        }
      } else if (tap && event.touches.length === 1) {
        const touch = event.touches[0];
        if (Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 10) tap = null;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (pinching) {
        if (event.touches.length < 2) {
          pinching = false;
          cancelAnimationFrame(frame);
          frame = 0;
          handlersRef.current.onPinchEnd(scale, originX, originY);
        }
        return;
      }
      if (tap && event.touches.length === 0 && event.timeStamp - tap.time < 300) {
        const { clientX, clientY } = event.changedTouches[0];
        const isDouble =
          event.timeStamp - lastTap.time < 320 && Math.hypot(clientX - lastTap.x, clientY - lastTap.y) < 40;
        if (isDouble) {
          lastTap = { time: 0, x: 0, y: 0 };
          const [x, y] = local(clientX, clientY);
          handlersRef.current.onDoubleTap?.(x, y);
        } else {
          lastTap = { time: event.timeStamp, x: clientX, y: clientY };
        }
      }
      tap = null;
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return; // plain wheel scrolls
      event.preventDefault();
      if (wheelScale === 1) [originX, originY] = local(event.clientX, event.clientY);
      wheelScale *= Math.exp(-event.deltaY / 250);
      handlersRef.current.onPinch(wheelScale, originX, originY);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        const finalScale = wheelScale;
        wheelScale = 1;
        handlersRef.current.onPinchEnd(finalScale, originX, originY);
      }, 160);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
    };
  }, [element]);
}

/**
 * Shared zoom plumbing: shows a live CSS-scaled preview while pinching, then
 * commits the new zoom and keeps the point under the fingers in place.
 */
export function previewScale(content: HTMLElement | null, scroller: HTMLElement | null, scale: number, x: number, y: number) {
  if (!content || !scroller) return;
  content.style.transformOrigin = `${scroller.scrollLeft + x}px ${scroller.scrollTop + y}px`;
  content.style.transform = `scale(${scale})`;
}

export function clearPreview(content: HTMLElement | null) {
  if (!content) return;
  content.style.transform = '';
  content.style.transformOrigin = '';
}

/** Scroll position that keeps the content point under (x, y) fixed after zooming by `ratio`. */
export function anchoredScroll(scroller: HTMLElement, ratio: number, x: number, y: number) {
  return {
    left: (scroller.scrollLeft + x) * ratio - x,
    top: (scroller.scrollTop + y) * ratio - y,
  };
}
