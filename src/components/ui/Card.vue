<template>
  <div :class="['bg-white rounded-xl border border-slate-200/80 shadow-sm transition-all', customClass]">
    <div v-if="$slots.header || title" class="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2.5">
      <div v-if="$slots.header" class="w-full">
        <slot name="header" />
      </div>
      <template v-else>
        <div class="min-w-0 flex-1 pr-1">
          <h3 v-if="title" class="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">{{ title }}</h3>
          <p v-if="description" class="text-xs text-slate-500 mt-1 leading-relaxed break-words">{{ description }}</p>
        </div>
        <div v-if="$slots.action" class="shrink-0">
          <slot name="action" />
        </div>
      </template>
    </div>
    <div :class="['p-4 sm:p-5', bodyClass]">
      <slot />
    </div>
    <div v-if="$slots.footer" class="p-4 pt-3 bg-slate-50/70 border-t border-slate-100 rounded-b-xl">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  }
})
</script>
