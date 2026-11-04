import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

const isFormControl = (node: React.ReactElement): boolean => {
  const componentName = typeof node.type === 'string'
    ? node.type
    : (node.type as { displayName?: string }).displayName;
  return ['input', 'textarea', 'select', 'TextInput', 'TextArea', 'Select'].includes(componentName ?? '');
};

const containsFormControl = (node: React.ReactNode): boolean =>
  React.isValidElement(node) &&
  (isFormControl(node) ||
    containsFormControl((node as React.ReactElement<{ children?: React.ReactNode }>).props.children));

const decorateFirstControl = (
  node: React.ReactNode,
  controlProps: Record<string, unknown>,
): React.ReactNode => {
  if (!React.isValidElement(node)) return node;
  const element = node as React.ReactElement<Record<string, unknown> & { children?: React.ReactNode }>;
  if (isFormControl(element)) return React.cloneElement(element, controlProps);

  const children = React.Children.toArray(element.props.children);
  const controlIndex = children.findIndex(containsFormControl);
  if (controlIndex < 0) return node;

  return React.cloneElement(element, {
    children: children.map((child, index) =>
      index === controlIndex ? decorateFirstControl(child, controlProps) : child,
    ),
  });
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
  className = '',
}) => {
  const generatedId = useId();
  const controlId = htmlFor ?? `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const childrenWithControl = (() => {
    const nodes = React.Children.toArray(children);
    const controlIndex = nodes.findIndex(containsFormControl);
    if (controlIndex < 0) return children;
    const control = nodes[controlIndex];
    if (!React.isValidElement(control)) return children;

    const props = control.props as { children?: React.ReactNode; [key: string]: unknown };
    const componentName = typeof control.type === 'string'
      ? control.type
      : (control.type as { displayName?: string }).displayName;
    const describedBy = [props['aria-describedby'], hintId, errorId]
      .filter(Boolean)
      .join(' ') || undefined;
    const originalOnInvalid = props.onInvalid as
      | React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | undefined;
    const originalOnInput = props.onInput as
      | React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | undefined;
    const isNativeControl = typeof control.type === 'string';
    const controlProps = {
      id: (props.id as string | undefined) ?? controlId,
      'aria-invalid': error ? true : props['aria-invalid'],
      'aria-describedby': describedBy,
      ...(isNativeControl ? {} : { error: error ? true : props.error }),
      onInvalid: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        originalOnInvalid?.(event);
        event.currentTarget.setAttribute('aria-invalid', 'true');
      },
      onInput: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        originalOnInput?.(event);
        if (event.currentTarget.validity.valid && !error) {
          event.currentTarget.removeAttribute('aria-invalid');
        }
      },
    };
    const replacement = ['input', 'textarea', 'select', 'TextInput', 'TextArea', 'Select']
      .includes(componentName ?? '')
      ? React.cloneElement(control, controlProps as Record<string, unknown>)
      : decorateFirstControl(control, controlProps as Record<string, unknown>);
    return nodes.map((node, index) => index === controlIndex ? replacement : node);
  })();

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={controlId}
          className="block font-mono text-xs font-medium uppercase tracking-wider text-neutral-400"
        >
          {label} {required && <span className="text-cyber-rose">*</span>}
        </label>
        {hint && (
          <span id={hintId} className="font-mono text-[10px] text-neutral-400">{hint}</span>
        )}
      </div>

      {childrenWithControl}

      {error && (
        <p id={errorId} className="font-mono text-xs text-rose-400 animate-fadeIn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
