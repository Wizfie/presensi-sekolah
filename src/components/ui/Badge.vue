<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 text-xs transition-colors',
      badgeStyles[status] || badgeStyles.default
    ]"
  >
    <span v-if="withDot" :class="['w-1.5 h-1.5 rounded-full mr-1.5', dotStyles[status] || dotStyles.default]"></span>
    <slot>{{ label || status }}</slot>
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    default: 'default' // hadir, terlambat, izin, sakit, alpa, pending, approved, rejected
  },
  label: {
    type: String,
    default: ''
  },
  withDot: {
    type: Boolean,
    default: true
  }
})

const badgeStyles = {
  hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  terlambat: 'bg-amber-50 text-amber-700 border-amber-200',
  izin: 'bg-blue-50 text-blue-700 border-blue-200',
  sakit: 'bg-purple-50 text-purple-700 border-purple-200',
  alpa: 'bg-rose-50 text-rose-700 border-rose-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200'
}

const dotStyles = {
  hadir: 'bg-emerald-500',
  terlambat: 'bg-amber-500',
  izin: 'bg-blue-500',
  sakit: 'bg-purple-500',
  alpa: 'bg-rose-500',
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  default: 'bg-slate-400'
}
</script>
