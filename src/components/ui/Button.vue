<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
      variants[variant] || variants.default,
      sizes[size] || sizes.default,
      customClass
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'default' // default, secondary, outline, ghost, destructive, success
  },
  size: {
    type: String,
    default: 'default' // sm, default, lg, icon
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]',
  outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-[0.98]',
  ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]'
}

const sizes = {
  sm: 'h-8 rounded-lg px-3 text-xs gap-1.5',
  default: 'h-10 rounded-lg px-4 py-2 text-sm gap-2',
  lg: 'h-12 rounded-xl px-6 text-base gap-2.5 font-semibold',
  icon: 'h-10 w-10 rounded-lg p-0'
}
</script>
