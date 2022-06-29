import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { WatchIgnorePlugin } from 'webpack';


test('test create room', async () => {
  const { getByText, getByTestId } = render(<App />);
  let createRoom = getByTestId('createRoomBtn')
  fireEvent.click(createRoom)
  await waitFor(() => {
    expect(getByTestId('roomName')).toBeInTheDocument()
  })
})

test('select ultimate', async () => {
  const { getByText, getByTestId } = render(<App />);
  act(() => {
    fireEvent.click(getByTestId('ultHelp'))
    fireEvent.click(getByTestId('emptyUltTile0'))
    fireEvent.click(getByTestId('ultSelect5006'))
  })
  await waitFor(() => {
    expect(getByTestId(''))
  })
})
