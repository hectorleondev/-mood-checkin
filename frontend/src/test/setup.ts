import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { tokenStorage } from '../shared/lib/tokenStorage'

afterEach(() => {
  cleanup()
  tokenStorage.clear()
})
