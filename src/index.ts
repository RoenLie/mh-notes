import { render } from 'lit';

import { AppRouterCmp } from './features/router/app-router.cmp.js';

AppRouterCmp.register();

render(document.createElement(AppRouterCmp.tagName), document.body);
