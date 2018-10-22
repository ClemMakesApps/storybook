import { types } from '@storybook/addons';

export function ensurePanel(panels, selectedPanel, currentPanel) {
  const keys = Object.keys(panels);

  if (keys.indexOf(selectedPanel) >= 0) {
    return selectedPanel;
  }

  if (keys.length) {
    return keys[0];
  }
  return currentPanel;
}

export default function initPanels({ store, provider }) {
  return {
    get selectedPanel() {
      const { panels, selectedPanelValue } = store.getState();
      return ensurePanel(panels, selectedPanelValue, selectedPanelValue);
    },

    set selectedPanel(value) {
      store.setState({ selectedPanelValue: value });
    },

    get panels() {
      return provider.getElements(types.PANEL);
    },
    selectPanel(panelName) {
      store.setState({ selectedPanel: panelName });
    },
  };
}
