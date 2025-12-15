/**
 * 路由栈管理模块
 * 用于管理应用的路由历史记录，支持智能返回和路由栈操作
 */

const STORAGE_KEY = 'route_stack_history';
const MAX_STACK_SIZE = 50; // 最大栈大小

// 从 localStorage 恢复路由栈
const loadRouteStackFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('恢复路由栈失败:', error);
    return [];
  }
};

// 保存路由栈到 localStorage
const saveRouteStackToStorage = (stack) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch (error) {
    console.warn('保存路由栈失败:', error);
  }
};

// 创建路由记录对象
const createRouteRecord = (route) => {
  return {
    path: route.path,
    name: route.name,
    params: { ...route.params },
    query: { ...route.query },
    hash: route.hash,
    fullPath: route.fullPath,
    meta: { ...route.meta },
    timestamp: Date.now(),
    id: `${route.fullPath}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

const state = {
  // 路由栈数组
  stack: loadRouteStackFromStorage(),
  // 当前路由在栈中的索引
  currentIndex: -1,
  // 是否启用路由栈管理
  enabled: true,
  // 最大栈大小
  maxSize: MAX_STACK_SIZE
};

const getters = {
  // 获取当前路由栈
  routeStack: state => state.stack,
  
  // 获取栈的大小
  stackSize: state => state.stack.length,
  
  // 获取当前路由索引
  currentIndex: state => state.currentIndex,
  
  // 是否可以返回（栈中有上一个路由）
  canGoBack: state => state.currentIndex > 0,
  
  // 是否可以前进（栈中有下一个路由）
  canGoForward: state => state.currentIndex < state.stack.length - 1,
  
  // 获取上一个路由
  previousRoute: state => {
    if (state.currentIndex > 0) {
      return state.stack[state.currentIndex - 1];
    }
    return null;
  },
  
  // 获取下一个路由
  nextRoute: state => {
    if (state.currentIndex < state.stack.length - 1) {
      return state.stack[state.currentIndex + 1];
    }
    return null;
  },
  
  // 获取当前路由
  currentRoute: state => {
    if (state.currentIndex >= 0 && state.currentIndex < state.stack.length) {
      return state.stack[state.currentIndex];
    }
    return null;
  },
  
  // 是否启用路由栈管理
  isEnabled: state => state.enabled
};

const mutations = {
  // 推入新路由到栈
  PUSH_ROUTE(state, route) {
    if (!state.enabled) return;
    
    const routeRecord = createRouteRecord(route);
    
    // 如果当前不在栈顶，移除当前索引之后的所有路由（类似浏览器历史记录）
    if (state.currentIndex < state.stack.length - 1) {
      state.stack = state.stack.slice(0, state.currentIndex + 1);
    }
    
    // 检查是否是相同路由（避免重复添加）
    const lastRoute = state.stack[state.stack.length - 1];
    if (lastRoute && lastRoute.fullPath === routeRecord.fullPath) {
      // 更新时间戳
      lastRoute.timestamp = routeRecord.timestamp;
      return;
    }
    
    // 添加新路由
    state.stack.push(routeRecord);
    state.currentIndex = state.stack.length - 1;
    
    // 限制栈大小
    if (state.stack.length > state.maxSize) {
      state.stack.shift();
      state.currentIndex--;
    }
    
    // 保存到 localStorage
    saveRouteStackToStorage(state.stack);
  },
  
  // 从栈中弹出路由
  POP_ROUTE(state) {
    if (state.stack.length > 0) {
      state.stack.pop();
      state.currentIndex = Math.max(0, state.currentIndex - 1);
      saveRouteStackToStorage(state.stack);
    }
  },
  
  // 设置当前路由索引
  SET_CURRENT_INDEX(state, index) {
    if (index >= 0 && index < state.stack.length) {
      state.currentIndex = index;
    }
  },
  
  // 清空路由栈
  CLEAR_STACK(state) {
    state.stack = [];
    state.currentIndex = -1;
    localStorage.removeItem(STORAGE_KEY);
  },
  
  // 移除指定索引的路由
  REMOVE_ROUTE(state, index) {
    if (index >= 0 && index < state.stack.length) {
      state.stack.splice(index, 1);
      
      // 调整当前索引
      if (state.currentIndex >= index) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      }
      
      saveRouteStackToStorage(state.stack);
    }
  },
  
  // 启用/禁用路由栈管理
  SET_ENABLED(state, enabled) {
    state.enabled = enabled;
  },
  
  // 设置最大栈大小
  SET_MAX_SIZE(state, size) {
    state.maxSize = size;
    
    // 如果当前栈超过新的最大大小，进行裁剪
    if (state.stack.length > size) {
      const removeCount = state.stack.length - size;
      state.stack.splice(0, removeCount);
      state.currentIndex = Math.max(0, state.currentIndex - removeCount);
      saveRouteStackToStorage(state.stack);
    }
  },
  
  // 恢复路由栈（用于页面刷新后恢复）
  RESTORE_STACK(state, { stack, currentIndex }) {
    state.stack = stack || [];
    state.currentIndex = currentIndex >= 0 ? currentIndex : state.stack.length - 1;
  }
};

const actions = {
  // 推入路由
  pushRoute({ commit }, route) {
    commit('PUSH_ROUTE', route);
  },
  
  // 弹出路由
  popRoute({ commit }) {
    commit('POP_ROUTE');
  },
  
  // 返回上一个路由
  goBack({ state, commit }, router) {
    if (state.currentIndex > 0) {
      const previousRoute = state.stack[state.currentIndex - 1];
      commit('SET_CURRENT_INDEX', state.currentIndex - 1);
      
      // 使用 router.push 而不是 router.go，避免触发浏览器历史记录
      return router.push({
        path: previousRoute.path,
        query: previousRoute.query,
        params: previousRoute.params
      });
    } else {
      // 如果栈中没有上一个路由，使用浏览器返回
      return router.go(-1);
    }
  },
  
  // 前进到下一个路由
  goForward({ state, commit }, router) {
    if (state.currentIndex < state.stack.length - 1) {
      const nextRoute = state.stack[state.currentIndex + 1];
      commit('SET_CURRENT_INDEX', state.currentIndex + 1);
      
      return router.push({
        path: nextRoute.path,
        query: nextRoute.query,
        params: nextRoute.params
      });
    } else {
      // 如果栈中没有下一个路由，使用浏览器前进
      return router.go(1);
    }
  },
  
  // 跳转到指定索引的路由
  goToIndex({ state, commit }, { index, router }) {
    if (index >= 0 && index < state.stack.length) {
      const targetRoute = state.stack[index];
      commit('SET_CURRENT_INDEX', index);
      
      return router.push({
        path: targetRoute.path,
        query: targetRoute.query,
        params: targetRoute.params
      });
    }
  },
  
  // 清空路由栈
  clearStack({ commit }) {
    commit('CLEAR_STACK');
  },
  
  // 移除指定路由
  removeRoute({ commit }, index) {
    commit('REMOVE_ROUTE', index);
  },
  
  // 启用/禁用路由栈管理
  setEnabled({ commit }, enabled) {
    commit('SET_ENABLED', enabled);
  },
  
  // 设置最大栈大小
  setMaxSize({ commit }, size) {
    commit('SET_MAX_SIZE', size);
  },
  
  // 恢复路由栈
  restoreStack({ commit }, data) {
    commit('RESTORE_STACK', data);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};