describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:8081')

    cy.get('[testID="home-screen"]').should('exist')
  })
})