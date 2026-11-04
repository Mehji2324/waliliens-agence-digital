import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useModalAccessibility } from './useModalAccessibility';

const TestModal = ({ onClose }: { onClose: () => void }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(true, panelRef, onClose);

  return (
    <div ref={panelRef} role="dialog" tabIndex={-1}>
      <button>First action</button>
      <button>Last action</button>
    </div>
  );
};

const ModalHarness = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open dialog</button>
      {isOpen && <TestModal onClose={close} />}
    </>
  );
};

describe('useModalAccessibility', () => {
  it('traps focus, closes on Escape, and restores focus', () => {
    render(<ModalHarness />);
    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    fireEvent.click(trigger);

    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Last action' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
  });
});
