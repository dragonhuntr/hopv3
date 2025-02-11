import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const isScrolledToBottom = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      isScrolledToBottom.current = scrollHeight - (scrollTop + clientHeight) < 50;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;
    if (!container || !end) return;

    // Use mutation observer to detect content changes
    const observer = new MutationObserver(() => {
      if (isScrolledToBottom.current) {
        end.scrollIntoView({ behavior: 'auto' });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Initial check
    if (isScrolledToBottom.current) {
      end.scrollIntoView({ behavior: 'auto' });
    }

    return () => observer.disconnect();
  }, []);

  return [containerRef, endRef];
}