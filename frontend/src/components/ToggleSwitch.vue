<template>
  <div class="toggle-switch" :class="{ 'disabled': disabled }">
    <label class="toggle-label">
      <input 
        type="checkbox" 
        :checked="modelValue"
        @change="handleToggle"
        :disabled="disabled"
        class="toggle-input"
      >
      <span class="toggle-slider" :class="{ 'active': modelValue }"></span>
      <span class="toggle-text">
        <slot>{{ modelValue ? 'Enabled' : 'Disabled' }}</slot>
      </span>
    </label>
    <div v-if="description" class="toggle-description">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  modelValue: boolean
  disabled?: boolean
  description?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  description: undefined,
})

const emit = defineEmits<Emits>()

const handleToggle = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = target.checked
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.toggle-switch {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-switch.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.toggle-switch.disabled .toggle-label {
  cursor: not-allowed;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-slider.active {
  background: #3b82f6;
}

.toggle-slider.active::before {
  transform: translateX(20px);
}

.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.toggle-input:disabled + .toggle-slider {
  cursor: not-allowed;
}

.toggle-text {
  user-select: none;
}

.toggle-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-left: 3.25rem; /* Align with toggle text */
}

/* Animation for smooth transitions */
@media (prefers-reduced-motion: no-preference) {
  .toggle-slider,
  .toggle-slider::before {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .toggle-slider {
    border: 2px solid #374151;
  }
  
  .toggle-slider.active {
    border-color: #1d4ed8;
  }
}

/* Focus styles for accessibility */
.toggle-input:focus-visible + .toggle-slider {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
