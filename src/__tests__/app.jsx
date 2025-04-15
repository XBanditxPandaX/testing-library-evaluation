import { rest } from "msw"
import { server } from "../../tests/server"

beforeEach(() => {
  server.use(
    rest.post("/form", (req, res, ctx) => {
      if (!req.body.food || !req.body.drink) {
        return res(
          ctx.status(400),
          ctx.json({
            message: "les champs food et drink sont obligatoires",
          }),
        )
      }
      return res(ctx.status(200), ctx.json({ data: req.body }))
    }),
  )
})