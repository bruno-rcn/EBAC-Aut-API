/// <reference types="cypress"/>
import contrato from '../contracts/produtos.contracts'

describe('Teste da funcionalidade produtos', () => {

    let token

    before(()=>{
        cy.token('fulano@qa.com', 'teste').then(tkn => {token = tkn})
    })

    it('Deve validar contrato', () => {
        cy.request('http://localhost:3000/produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });
    
    it('Listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/produtos'
        }).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(15) //ms
        })
            
    });

    it('Cadastrar produto', () => {

        let produto = `Produto ${Math.floor(Math.random() * 100)}`

        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/produtos',
            body: {
                "nome": produto,
                "preco": 45,
                "descricao": "Curso de QA",
                "quantidade": 8
                },
                headers: {authorization: token}
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
            expect(response.duration).to.be.lessThan(15) //ms
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, 'Produto EBAC Novo1', 200, 'Produto EBAC novo', 180)
        .then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
            expect(response.duration).to.be.lessThan(15) //ms
        })
    });

    it('Deve editar um produto ja cadastrado', () => {
        cy.request('http://localhost:3000/produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": "Produto 20",
                    "preco": 470,
                    "descricao": "Mouse",
                    "quantidade": 381
                }
            }).then((response) => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
                expect(response.duration).to.be.lessThan(15) //ms
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto teste ${Math.floor(Math.random() * 100)}`
        cy.cadastrarProduto(token, produto, 200, 'Produto EBAC novo', 180)
        .then((response) => {
            let id = response.body._id
            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": produto,
                    "preco": 470,
                    "descricao": "Mouse",
                    "quantidade": 381
                }
            })
        })
    });

    it('Deve deletar produto previamente cadastrado', () => {
        let produto = `Produto teste ${Math.floor(Math.random() * 100)}`
        cy.cadastrarProduto(token, produto, 200, 'Produto EBAC novo', 180)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3000/produtos/${id}`,
                headers: {authorization: token}
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.duration).to.be.lessThan(30) //ms
            })
        })
    });

});