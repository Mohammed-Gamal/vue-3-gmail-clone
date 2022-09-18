<template>
  <h1>VMail Inbox</h1>

  <Suspense>
    <!-- component with async dependency -->
    <template #default>
      <MailTable />
    </template>

    <!-- loading state via #fallback slot -->
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>


<script>
  import MailTable from '@/components/MailTable.vue';

  export default {
    name: 'App',
    components: {
      MailTable
    }
  }
</script>
