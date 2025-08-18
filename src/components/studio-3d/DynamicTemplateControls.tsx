'use client';

import { useState } from 'react';
import { UIControl, UISection } from '@/lib/three/template-ui-schemas';

interface DynamicControlProps {
  control: UIControl;
  value: any;
  onChange: (value: any) => void;
}

// Individual control components
function TextControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={control.placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {control.description && (
        <p className="text-xs text-gray-500 mt-1">{control.description}</p>
      )}
    </div>
  );
}

function ColorControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded"
        />
        <input
          type="text"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-mono"
        />
      </div>
    </div>
  );
}

function SliderControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <input
        type="range"
        min={control.min || 0}
        max={control.max || 100}
        step={control.step || 1}
        value={value || control.defaultValue || 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{control.min || 0}</span>
        <span className="font-medium">{value || control.defaultValue || 0}</span>
        <span>{control.max || 100}</span>
      </div>
    </div>
  );
}

function SelectControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select {control.label}</option>
        {control.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700 dark:text-gray-300">
        {control.label}
      </label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function FileControl({ control, value, onChange }: DynamicControlProps) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <input
          type="file"
          accept={control.accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
          className="hidden"
          id={`file-${control.id}`}
        />
        <label
          htmlFor={`file-${control.id}`}
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value ? value.name : `Upload ${control.label}`}
          </span>
        </label>
      </div>
    </div>
  );
}

function ColorSchemeControl({ control, value, onChange }: DynamicControlProps) {
  const colorSchemes = {
    professional: ['#1E40AF', '#059669', '#DC2626'],
    vibrant: ['#F59E0B', '#EC4899', '#8B5CF6'],
    elegant: ['#FFD700', '#FFF8E7', '#FF69B4'],
    playful: ['#10B981', '#F472B6', '#60A5FA'],
    tech: ['#06B6D4', '#8B5CF6', '#F97316'],
    warm: ['#EF4444', '#F59E0B', '#FB923C'],
    cool: ['#3B82F6', '#06B6D4', '#8B5CF6'],
    monochrome: ['#000000', '#6B7280', '#E5E7EB'],
  };

  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {control.options?.map((option) => {
          const scheme = colorSchemes[option.value as keyof typeof colorSchemes];
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                value === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {scheme?.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiSelectControl({ control, value, onChange }: DynamicControlProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleValue = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {control.label}
      </label>
      <div className="space-y-2">
        {control.options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => toggleValue(option.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Main dynamic control renderer
export function DynamicControl({ control, value, onChange }: DynamicControlProps) {
  switch (control.type) {
    case 'text':
      return <TextControl control={control} value={value} onChange={onChange} />;
    case 'color':
      return <ColorControl control={control} value={value} onChange={onChange} />;
    case 'slider':
      return <SliderControl control={control} value={value} onChange={onChange} />;
    case 'select':
      return <SelectControl control={control} value={value} onChange={onChange} />;
    case 'toggle':
      return <ToggleControl control={control} value={value} onChange={onChange} />;
    case 'file':
      return <FileControl control={control} value={value} onChange={onChange} />;
    case 'colorScheme':
      return <ColorSchemeControl control={control} value={value} onChange={onChange} />;
    case 'multiSelect':
      return <MultiSelectControl control={control} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

// Section component
interface DynamicSectionProps {
  section: UISection;
  values: Record<string, any>;
  onChange: (category: string, key: string, value: any) => void;
}

export function DynamicSection({ section, values, onChange }: DynamicSectionProps) {
  const [isExpanded, setIsExpanded] = useState(section.defaultExpanded !== false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => section.collapsible !== false && setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        disabled={section.collapsible === false}
      >
        <div className="flex items-center space-x-2">
          {section.icon && <span className="text-lg">{section.icon}</span>}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {section.title}
          </h3>
        </div>
        {section.collapsible !== false && (
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {section.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {section.description}
            </p>
          )}
          {section.controls.map((control) => (
            <DynamicControl
              key={control.id}
              control={control}
              value={values[control.id]}
              onChange={(value) => onChange(control.category || 'options', control.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}