<script setup lang="ts">
import { UNCATEGORIZED_FOLDER } from '#shared/schemas/folder'

definePageMeta({
  layout: 'dashboard',
})

const linksStore = useDashboardLinksStore()
useDashboardLinksRouteState()

// Creating a link while browsing a folder should land it in that folder.
const newLinkDefaults = computed(() => ({
  folderId: linksStore.folder && linksStore.folder !== UNCATEGORIZED_FOLDER ? linksStore.folder : null,
}))
</script>

<template>
  <Tabs v-model="linksStore.status" default-value="active" as-child>
    <main class="space-y-6">
      <h1 class="sr-only">
        {{ $t('links.group_title') }}
      </h1>
      <Teleport to="#dashboard-header-actions" defer>
        <DashboardLinksSearchDialog />
        <DashboardLinksEditorModal :link="newLinkDefaults" />
      </Teleport>

      <DashboardFoldersFolderHeader />
      <DashboardLinksFilters />
      <TabsContent value="active">
        <DashboardLinks />
      </TabsContent>
      <TabsContent value="expired">
        <DashboardLinks />
      </TabsContent>
    </main>
  </Tabs>
</template>
