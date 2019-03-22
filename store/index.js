import Vuex from 'vuex'
import Cookie from 'js-cookie'

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: []
    },
    mutations: {
      setPosts(state, posts) {
        state.loadedPosts = posts
      },
      addPost(state, post) {
        state.loadedPosts.push(post)
      },
      editPost(state, editedPost) {
        const postIndex = state.loadedPosts.findIndex(post => post.id === editedPost.id)
        state.loadedPosts[postIndex] = editedPost
      },
      setToken(state, token) {
        state.token = token
      },
      clearToken(state) {
        state.token = null
      }
    },
    actions: {
      nuxtServerInit(vuexContext, context) {
        return context.app.$axios
          .$get('/posts.json')
          .then(data => {
            const postArray = []
            for (const key in data) {
              postArray.push({ ...data[key], id: key })
            }
            vuexContext.commit('setPosts', postArray)
          })
          .catch(e => context.error(e))
      },
      addPost(vuexContent, post) {
        const createdPost = {
          ...post,
          updatedDate: new Date()
        }
        return this.$axios.$post(`/posts.json?auth=${vuexContent.state.token}`, createdPost)
          .then(data => {
            vuexContent.commit('addPost', { ...createdPost, id: data.name })
          })
          .catch(e => console.log(e))
      },
      editPost(vuexContent, editedPost) {
        return this.$axios.$put(`/posts/${editedPost.id}.json?auth=${vuexContent.state.token}`, editedPost)
          .then(res => vuexContent.commit('editPost', editedPost))
          .catch(e => console.log(e))
      },
      setPosts(vuexContext, posts) {
        vuexContext.commit('setPosts', posts)
      },
      authenticateUser(vuexContext, authData) {
        let authUrl = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key='
        if (!authData.isLogin) {
          authUrl = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key='
        }
        return this.$axios.$post(
          authUrl + process.env.fbAPIKey,
          {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
          }
        ).then(result => {
          vuexContext.commit('setToken', result.idToken)
          localStorage.setItem('token', result.idToken)
          localStorage.setItem('tokenExpiration', new Date().getTime() + +result.expiresIn * 1000)
          Cookie.set('jwt', result.idToken)
          Cookie.set('expirationDate', new Date().getTime() + +result.expiresIn * 1000)
          return result
          //return this.$axios.$post('http://localhost:3000/api/track-data', { data: 'Authenticated' })
        })
          .catch(e => {
            console.log(e)
            return e
          })
      },
      initAuth(vuexContent, req) {
        let token;
        let expirationDate;

        if (req) {
          if (!req.headers.cookie) {
            return;
          }
          const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='))
          if (!jwtCookie) {
            return;
          }
          token = jwtCookie.split('=')[1];
          expirationDate = req.headers.cookie.split(';')
            .find(c => c.trim().startsWith('expirationDate='))
            .split('=')[1]

        } else if (process.client) {
          token = localStorage.getItem('token')
          expirationDate = localStorage.getItem('tokenExpiration')
        }
        if (new Date().getTime() > +expirationDate || !token) {
          console.log('No token or invalid token');
          vuexContent.dispatch('logout')
          return
        }
        vuexContent.commit('setToken', token)
      },
      logout(vuexContent) {
        vuexContent.commit('clearToken')
        Cookie.remove('jwt')
        Cookie.remove('expirationDate')
        if (process.client) {
          localStorage.removeItem('tokenExpiration')
          localStorage.removeItem('token')
        }
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts
      },
      isAuthenticated(state) {
        return state.token != null
      }
    }
  })
}

export default createStore
