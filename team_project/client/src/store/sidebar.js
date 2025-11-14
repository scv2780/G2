import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    menuData: null,
  }),

  actions: {
    setMenu(data) {
      this.menuData = data;
    },
  },
});
