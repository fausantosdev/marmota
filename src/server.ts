import { app } from './app'
import { env } from './env'

app.listen({
  port: parseInt(env.PORT)
}).then(() => {
  console.log('~ server running on port 3333')
})
