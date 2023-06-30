/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contracts'

describe('Testes da Funcionalidade Usuários', () => {

    it('Deve validar contrato de usuários', () => {
     cy.request('http://localhost:3000/usuarios').then(response => {
          return contrato.validateAsync(response.body)
      })
    });

    it('Deve listar usuários cadastrados', () => {
          cy.request({
               method: 'GET',
               url: 'http://localhost:3000/usuarios'
          }).then((response) => {
               expect(response.status).to.equal(200)
               expect(response.body).to.have.property('usuarios')
               expect(response.duration).to.be.lessThan(15) //ms
          })
    });

    it('Deve cadastrar um usuário com sucesso', () => {
     let email = `email${Math.floor(Math.random() * 100)}@teste.com`
          cy.request({
               method: 'POST',
               url: 'http://localhost:3000/usuarios',
               body: {
                    "nome": "Usuario QA 2",
                    "email": email,
                    "password": "12345678",
                    "administrador": "false"
               }
          }).then((response) => {
               expect(response.status).to.equal(201)
               expect(response.body.message).to.equal('Cadastro realizado com sucesso')
          })
     })

    it('Deve validar um usuário com email inválido', () => {
     cy.request({
          method: 'POST',
          url: 'http://localhost:3000/usuarios',
          body: {
               "nome": "Bruno Ricardo",
               "email": "abc",
               "password": "12345678",
               "administrador": "false"
          },
          failOnStatusCode: false
     }).then((response) => {
          expect(response.status).to.equal(400)
          expect(response.body.email).to.equal('email deve ser um email válido')
     })  
    });

    it('Deve editar um usuário previamente cadastrado', () => {
     let emailAdm = `adm${Math.floor(Math.random() * 100)}@teste.com`
     cy.cadastrarUsuarioAdm('Perfil para editar', emailAdm, '123456')
     .then((response) => {
          let id = response.body._id
          cy.request({
              method: 'PUT',
              url: `http://localhost:3000/usuarios/${id}`,
              body: {
               "nome": "Perfil editado",
               "email": emailAdm,
               "password": "12345678",
               "administrador": "false"
              }
          }).then(response => {
               expect(response.body.message).to.equal('Registro alterado com sucesso')
          })
      })
    });

    it('Deve deletar um usuário previamente cadastrado', () => {
     let emailAdm = `adm${Math.floor(Math.random() * 100)}@teste.com`
     cy.cadastrarUsuarioAdm('Perfil para editar', emailAdm, '123456')
     .then(response => {
          let id = response.body._id
          cy.request({
              method: 'DELETE',
              url: `http://localhost:3000/usuarios/${id}`
          }).then((response) => {
              expect(response.status).to.equal(200)
              expect(response.body.message).to.equal('Registro excluído com sucesso')
              expect(response.duration).to.be.lessThan(30) //ms
          })
      })
    });

})
