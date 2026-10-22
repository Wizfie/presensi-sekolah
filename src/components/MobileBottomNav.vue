<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 select-none">
    <div class="flex items-center justify-around max-w-md mx-auto h-14">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        @click="$emit('update:modelValue', item.key)"
        :class="[
          'relative flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-200 cursor-pointer',
          modelValue === item.key
            ? 'text-blue-600 font-bold'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        ]"
      >
        <!-- Icon Container with Badge -->
        <div class="relative flex items-center justify-center">
          <!-- Active Pill Indicator -->
          <div
            v-if="modelValue === item.key"
            class="absolute inset-0 -mx-3 -my-0.5 bg-blue-50 rounded-full -z-10 animate-in fade-in zoom-in-75 duration-200"
          ></div>

          <span
            class="material-icons text-xl sm:text-2xl transition-transform duration-200"
            :class="modelValue === item.key ? 'scale-110' : ''"
          >
            {{ item.icon }}
          </span>

          <!-- Badge Bubble -->
          <span
            v-if="item.badge !== undefined && item.badge !== null && item.badge > 0"
            class="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[15px] h-[15px] flex items-center justify-center border border-white shadow-2xs"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </div>

        <!-- Label -->
        <span
          class="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px] leading-tight"
          :class="modelValue === item.key ? 'text-blue-600 font-bold' : 'text-slate-500'"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>
