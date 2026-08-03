import { defineStore } from "pinia";
import { useAppStore } from "./app.store";
import { useDashboardStore } from "./dashboard.store";
import { useSnackbarStore } from "./snackbar.store";
import { useLoaderStore } from "./loader.store";
import { useConfirmStore } from "./confirm.store";

export const useWorkoutStore = defineStore("workout", {
  state: () => ({
    draft: null,
    dialog: { open: false, type: "exercise", mode: "add", form: {} },
    expandedId: null,
  }),

  getters: {
    dlgTitle(state) {
      return state.dialog.mode === "edit" ? "Edit exercise" : "Add exercise";
    },
  },

  actions: {
    clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    sanitizeWeight(value) {
      const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
      const [whole, ...rest] = cleaned.split(".");
      return rest.length ? `${whole}.${rest.join("")}` : whole;
    },

    setWeight(value) {
      this.dialog.form.weight = this.sanitizeWeight(value);
    },

    persist() {
      if (!this.draft) return;
      const dash = useDashboardStore();
      const i = dash.routines.findIndex((r) => r.id === this.draft.id);
      if (i >= 0) dash.routines[i] = this.clone(this.draft);
    },

    loadDraft(id) {
      const src = useDashboardStore().getById(id);
      this.draft = src ? this.clone(src) : null;
      this.expandedId = null;
      return !!this.draft;
    },

    toggleExpand(exId) {
      this.expandedId = this.expandedId === exId ? null : exId;
    },

    async toggleExercise(exId) {
      const ex = this.draft?.exercises.find((e) => e.id === exId);
      if (!ex) return;

      await useLoaderStore().wrap(() => {
        ex.done = !ex.done;
        this.persist();
        useSnackbarStore().success(
          ex.done ? `"${ex.name}" marked done` : `"${ex.name}" unmarked`,
        );
      });
    },

    openDialog(mode = "add", form = {}) {
      this.dialog = { open: true, type: "exercise", mode, form: { ...form } };
    },

    closeDialog() {
      this.dialog.open = false;
    },

    openAdd() {
      this.openDialog("add", { name: "", weight: "", description: "" });
    },

    openEdit(ex) {
      this.openDialog("edit", {
        ...ex,
        weight: this.sanitizeWeight(ex.weight),
      });
    },

    async saveExercise() {
      const snack = useSnackbarStore();
      const { mode, form } = this.dialog;
      if (!this.draft || !form.name?.trim()) {
        snack.warning("Exercise name is required");
        return;
      }

      const weight = this.sanitizeWeight(form.weight);
      await useLoaderStore().wrap(() => {
        if (mode === "edit") {
          const ex = this.draft.exercises.find((e) => e.id === form.id);
          if (ex)
            Object.assign(ex, {
              name: form.name,
              weight,
              description: form.description || "",
            });
          snack.success("Exercise updated");
        } else {
          this.draft.exercises.push({
            id: useDashboardStore().nextId(),
            name: form.name.trim(),
            weight,
            description: form.description || "",
            done: false,
          });
          snack.success("Exercise added");
        }
        this.persist();
        this.closeDialog();
      });
    },

    async deleteExercise(exId) {
      if (!this.draft) return;
      const name = this.draft.exercises.find((e) => e.id === exId)?.name;

      const ok = await useConfirmStore().ask({
        title: "Delete exercise?",
        message: name
          ? `"${name}" will be removed from this routine.`
          : "This exercise will be removed from this routine.",
        confirmLabel: "Delete",
      });
      if (!ok) return;

      await useLoaderStore().wrap(() => {
        this.draft.exercises = this.draft.exercises.filter(
          (e) => e.id !== exId,
        );
        if (this.expandedId === exId) this.expandedId = null;
        this.persist();
        useSnackbarStore().success(
          name ? `"${name}" deleted` : "Exercise deleted",
        );
      });
    },

    goBack() {
      this.persist();
      this.draft = null;
      this.expandedId = null;
      useAppStore().goDashboard();
    },
  },
});
