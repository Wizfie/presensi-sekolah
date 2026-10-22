<template>
  <div :class="['relative', fullWidth ? 'w-full' : 'shrink-0']">
    <!-- Invisible Backdrop to Close on Outside Click -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 cursor-default"
      @click="closeDropdown"
    />

    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      :class="[
        'rounded-xl border border-slate-200 bg-white hover:border-blue-300 text-xs font-semibold text-slate-700 shadow-2xs flex items-center justify-between gap-1.5 cursor-pointer transition-all min-w-0 select-none text-left',
        size === 'sm' ? 'h-8 px-2.5' : 'h-9 px-3',
        isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : '',
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : '',
        fullWidth ? 'w-full' : 'shrink-0'
      ]"
    >
      <div class="flex items-center gap-1.5 min-w-0 truncate">
        <span v-if="icon" class="material-icons text-xs text-blue-600 shrink-0">{{ icon }}</span>
        <span class="truncate font-semibold" :class="selectedOption ? 'text-slate-800' : 'text-slate-400 font-normal'">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
      </div>
      <span
        class="material-icons text-xs text-slate-400 transition-transform duration-200 shrink-0 ml-1"
        :class="{ 'rotate-180 text-blue-600': isOpen }"
      >
        expand_more
      </span>
    </button>

    <!-- Popover Card -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0 -translate-y-1"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100 translate-y-0"
      leave-to-class="scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 space-y-0.5 animate-in fade-in',
          align === 'right' ? 'right-0' : 'left-0',
          fullWidth ? 'w-full min-w-full' : 'min-w-[180px] max-w-[280px]'
        ]"
      >
        <!-- Popover Title / Category -->
        <div v-if="title" class="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {{ title }}
        </div>

        <!-- Options List -->
        <div class="max-h-60 overflow-y-auto no-scrollbar space-y-0.5 py-0.5">
          <button
            v-for="opt in normalizedOptions"
            :key="String(opt.value)"
            type="button"
            @click="selectOption(opt.value)"
            :class="[
              'w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-left',
              modelValue === opt.value
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span
                v-if="opt.icon"
                class="material-icons text-xs shrink-0"
                :class="modelValue === opt.value ? 'text-white' : 'text-slate-400'"
              >
                {{ opt.icon }}
              </span>
              <span class="truncate">{{ opt.label }}</span>
            </span>

            <span
              v-if="opt.badge !== undefined"
              class="text-[10px] shrink-0 ml-1.5 px-1 py-0.2 rounded"
              :class="modelValue === opt.value ? 'bg-white/20 text-white font-bold' : 'text-slate-400 bg-slate-100 font-medium'"
            >
              {{ opt.badge }}
            </span>
            <span
              v-else-if="modelValue === opt.value"
              class="material-icons text-xs text-white shrink-0 ml-1.5"
            >
              check
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Pilih opsi...'
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  align: {
    type: String,
    default: 'left' // 'left', 'right'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label ?? String(opt.value),
        icon: opt.icon,
        badge: opt.badge
      }
    }
    return {
      value: opt,
      label: String(opt),
      icon: null,
      badge: undefined
    }
  })
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue)
})

function selectOption(val) {
  emit('update:modelValue', val)
  emit('change', val)
  closeDropdown()
}
</script>
