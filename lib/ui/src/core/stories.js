import qs from 'qs';

export default function initStories({ store, history }) {
  return {
    jumpToStory(direction) {
      const state = store.getState();
      const { storiesHash } = state;
      const { componentRoot, component } = this.urlData;
      let selectedId = component;

      const lookupList = Object.keys(storiesHash).filter(
        k => !(storiesHash[k].children || Array.isArray(storiesHash[k]))
      );

      if (!selectedId || !storiesHash[selectedId]) {
        selectedId = state.selectedId || Object.keys(storiesHash)[0];
      }
      const index = lookupList.indexOf(selectedId);

      // cannot navigate beyond fist or last
      if (index === lookupList.length - 1 && direction > 0) {
        return;
      }
      if (index === 0 && direction < 0) {
        return;
      }
      if (direction === 0) {
        return;
      }

      const result = lookupList[index + direction];

      if (componentRoot) {
        history.navigate(`?path=/${componentRoot}/${result}`);
        store.setState({ selectedId: result });
      }
    },
    jumpToComponent(direction) {
      const state = store.getState();
      const { storiesHash } = state;
      const { componentRoot, component } = this.urlData;
      let selectedId = component;
      const lookupList = Object.keys(storiesHash).filter(
        k =>
          (!storiesHash[k].children || Array.isArray(storiesHash[k])) &&
          (storiesHash[k].kind !== storiesHash[selectedId].kind || k === selectedId)
      );
      console.log(lookupList);
      const dirs = Object.entries(storiesHash).reduce((acc, i) => {
        const key = i[0];
        const value = i[1];
        if (value.isComponent) {
          acc[key] = [...i[1].children];
        }
        return acc;
      }, []);
      console.log('dirs', dirs);

      const idx = Object.values(dirs).findIndex(i => i.includes(selectedId));
      console.log('idx', idx);

      if (!selectedId || !storiesHash[selectedId]) {
        selectedId = state.selectedId || Object.keys(storiesHash)[0];
      }
      // const index = dirs.indexOf(selectedId);

      // cannot navigate beyond fist or last
      if (idx === dirs.length - 1 && direction > 0) {
        return;
      }
      if (idx === 0 && direction < 0) {
        return;
      }
      if (direction === 0) {
        return;
      }

      const result = dirs[idx + direction];

      if (componentRoot) {
        history.navigate(`?path=/${componentRoot}/${result}`);
        store.setState({ selectedId: result });
      }
    },
    navigate(path) {
      history.navigate(`?path=${path}`);
    },
    get urlState() {
      return {
        selectedKind: this.selectedKind,
        selectedStory: this.selectedStory,
        selectedPanel: this.selectedPanel,
        full: Number(Boolean(this.shortcutOptions.full)),
        panel:
          this.shortcutOptions.panel === 'right' || this.shortcutOptions.panel === 'bottom'
            ? this.shortcutOptions.panel
            : false,
        nav: Number(Boolean(this.shortcutOptions.nav)),
        ...this.customQueryParams,
      };
    },

    get urlData() {
      const { search } = history.location;
      const { path = '' } = qs.parse(search, { ignoreQueryPrefix: true });
      const [, p1, p2] = path.match(/\/([^/]+)\/([^/]+)?/) || [];

      const result = {};
      if (p1 && p1.match(/(components|info)/)) {
        Object.assign(result, {
          componentRoot: p1,
          component: p2,
        });
      }
      return result;
    },

    setStories(storiesHash) {
      const state = store.getState();
      store.setState({ storiesHash });

      const { componentRoot, component } = this.urlData;

      // when there's no selectedId or the selectedId item doesn't exist
      // we try to resolve from state or pick the first leaf and navigate
      if (!component || !storiesHash[component]) {
        // find first leaf
        const selectedId =
          state.selectedId || Object.values(storiesHash).find(s => !s.children).path;

        if (componentRoot) {
          history.navigate(`?path=/${componentRoot}/${selectedId}`);
        }
        store.setState({ selectedI: selectedId });
      } else {
        store.setState({ selectedI: component });
      }
    },

    selectStory(kind, story, { location } = {}) {
      let selectedId;
      const state = store.getState();

      if (location) {
        const { storiesHash } = state;

        const { componentRoot, component } = this.urlData;
        selectedId = component;

        if (!selectedId || !storiesHash[selectedId]) {
          selectedId = state.selectedId || Object.keys(storiesHash)[0];
        }

        if (componentRoot) {
          history.navigate(`?path=/${componentRoot}/${component}`);
        }

        store.setState({ selectedId });
      } else {
        throw new Error('NOT ALLOWED, must use location!');
      }
    },

    selectInCurrentKind(name) {
      const { componentRoot, component } = this.urlData;
      const selectedId = component.replace(/([^-]+)$/, name);

      if (componentRoot) {
        history.navigate(`?path=/${componentRoot}/${selectedId}`);
      }

      store.setState({ selectedId });
    },
  };
}
