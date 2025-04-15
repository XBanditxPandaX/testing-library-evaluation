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

  //Page d'accueil
  expect(screen.getByText('Welcome home')).toBeInTheDocument()
  const fillFormLink = screen.getByText('Fill out the form')
  expect(fillFormLink).toBeInTheDocument()
  userEvent.click(fillFormLink)

  //Page 1
  expect(screen.getByText('Page 1')).toBeInTheDocument()
  expect(screen.getByText('Go Home')).toBeInTheDocument()
  const foodInput = screen.getByLabelText(/favorite food/i)
  expect(foodInput).toBeInTheDocument()
  userEvent.type(foodInput, 'Pastas')
  const next = screen.getByText('Next')
  expect(next).toBeInTheDocument()
  userEvent.click(next)

  //Page 2
  expect(screen.getByText('Page 2')).toBeInTheDocument()
  expect(screen.getByText('Go Back')).toBeInTheDocument()
  const drinkInput = screen.getByLabelText(/favorite drink/i)
  expect(drinkInput).toBeInTheDocument()
  userEvent.type(drinkInput, 'Coca-Cola Zero')
  const reviewLink = screen.getByText('Review')
  expect(reviewLink).toBeInTheDocument()
  userEvent.click(reviewLink)

  //Page de confirmation
  expect(screen.getByRole('heading', {name: 'Confirm'})).toBeInTheDocument()
  expect(screen.getByText('Please confirm your choices')).toBeInTheDocument()
  expect(screen.getByLabelText(/favorite food/i)).toHaveTextContent('Pastas')
  expect(screen.getByLabelText(/favorite drink/i)).toHaveTextContent(
    'Coca-Cola Zero',
  )
  expect(screen.getByText('Go Back')).toBeInTheDocument()
  const confirmButton = screen.getByRole('button', {name: 'Confirm'})
  expect(confirmButton).toBeInTheDocument()
  userEvent.click(confirmButton)

  //Page de succès
  await waitFor(() => {
    expect(screen.getByText('Congrats. You did it.')).toBeInTheDocument()
  })

  const goHomeLink = screen.getByText('Go home')
  expect(goHomeLink).toBeInTheDocument()
  userEvent.click(goHomeLink)
  expect(screen.getByText('Welcome home')).toBeInTheDocument()
})

test('Scénario 2 : Parcours avec erreur (champ food vide)', async () => {
  render(<App />)

  //Page d'accueil
  expect(screen.getByText('Welcome home')).toBeInTheDocument()
  const fillFormLink = screen.getByText('Fill out the form')
  expect(fillFormLink).toBeInTheDocument()
  userEvent.click(fillFormLink)

  //Page 1
  expect(screen.getByText('Page 1')).toBeInTheDocument()
  expect(screen.getByText('Go Home')).toBeInTheDocument()
  const foodInput = screen.getByLabelText(/favorite food/i)
  expect(foodInput).toBeInTheDocument()
  const nextLink = screen.getByText('Next')
  expect(nextLink).toBeInTheDocument()
  userEvent.click(nextLink)

  //Page 2
  expect(screen.getByText('Page 2')).toBeInTheDocument()
  expect(screen.getByText('Go Back')).toBeInTheDocument()
  const drinkInput = screen.getByLabelText(/favorite drink/i)
  expect(drinkInput).toBeInTheDocument()
  userEvent.type(drinkInput, 'Coca-Cola Zero')
  const reviewLink = screen.getByText('Review')
  expect(reviewLink).toBeInTheDocument()
  userEvent.click(reviewLink)

  //Page de confirmation
  expect(screen.getByRole('heading', {name: 'Confirm'})).toBeInTheDocument()
  expect(screen.getByText('Please confirm your choices')).toBeInTheDocument()
  expect(screen.getByLabelText(/favorite food/i)).toHaveTextContent('')
  expect(screen.getByLabelText(/favorite drink/i)).toHaveTextContent(
    'Coca-Cola Zero',
  )
  expect(screen.getByText('Go Back')).toBeInTheDocument()
  const confirmButton = screen.getByRole('button', {name: 'Confirm'})
  expect(confirmButton).toBeInTheDocument()
  userEvent.click(confirmButton)
})
