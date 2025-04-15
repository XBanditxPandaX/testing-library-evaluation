import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {rest} from 'msw'
import {server} from '../../tests/server'
import App from '../app'

beforeEach(() => {
  server.use(
    rest.post('/form', (req, res, ctx) => {
      if (!req.body.food || !req.body.drink) {
        return res(
          ctx.status(400),
          ctx.json({
            message: 'les champs food et drink sont obligatoires',
          }),
        )
      }
      return res(ctx.status(200), ctx.json({data: req.body}))
    }),
  )
})

test('Scénario 1 : Parcours complet du formulaire avec succès', async () => {
  render(<App />)

  expect(screen.getByText('Welcome home')).toBeInTheDocument()

  const fillFormLink = screen.getByText('Fill out the form')
  expect(fillFormLink).toBeInTheDocument()
  userEvent.click(fillFormLink)

  expect(screen.getByText('Page 1')).toBeInTheDocument()
  expect(screen.getByText('Go Home')).toBeInTheDocument()

  const foodInput = screen.getByLabelText(/favorite food/i)
  expect(foodInput).toBeInTheDocument()
  userEvent.type(foodInput, 'Les pâtes')

  const next = screen.getByText('Next')
  expect(next).toBeInTheDocument()
  userEvent.click(next)
})
