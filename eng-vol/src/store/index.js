import { createStore } from "vuex";
import userModule from "./modules/userModule";
import classModule from "./modules/classModule";
import setModule from "./modules/setModule";
import wordModule from "./modules/wordModule"

const store = createStore({
    modules: {
        userModule,
        classModule,
        setModule,
        wordModule
    }
});

export default store;
