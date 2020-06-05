const {expect} = require('chai');
const addon = require('../build/Release/addon.node');



describe('adding a New team in the engine for construction of shares', function() {
    it('New team should be added', function() {
        let output = addon.addTeam("team test",4,3,false);  
        expect(output).to.equal(true);
    })
});

describe('adding an existing team in the engine for construction of shares', function() {
    it('Team should be not added', function() {
        addon.addTeam("coders",4,3,false);
        let output = addon.addTeam("coders",4,3,false);  
        expect(output).to.equal(false);
    })
});

describe('adding an existing team in the engine for reconstruction of shares', function() {
    it('Team should be not added because at a time team can be for construction or either for reconstruction', function() {
        addon.addTeam("codegeeks",4,3,false);
        let output = addon.addTeam("codegeeks",4,3,true);  
        expect(output).to.equal(false);
    })
});

describe('adding a new team in the engine for reconstruction of shares', function() {
    it('Team should be added', function() {
        let output = addon.addTeam("mathematicians",6,4,true);  
        expect(output).to.equal(true);
    })
});

describe('adding 1st member in a existing team for construction', function() {
    addon.addTeam("codegeeks",4,3,false);
    let output = addon.addMember("codegeeks","anubhav",false);
    it('no error should be there', function() {
        expect(output.error).to.equal('');
    })
    it('team should not be completed', function() {
        expect(output.allMemberJoined).to.equal(false);
    })
    it('member should be added', function(){
        expect(output.message).to.equal("member added successfully");
    })
})

describe('adding member in a non-existing team for construction', function() {
    let output = addon.addMember("magicians","anubhav",false);
    it('no error should be there', function() {
        expect(output.error).to.equal('');
    })
    it('member should not be added as team does not exist', function() {
        expect(output.message).to.equal("team doesnot exist");
    })
});

describe('adding member in a team for reconstruction and team exist in engine for construction', function(){
    addon.addTeam("hello",6,4,false);
    let output = addon.addMember("hello","raghav",true);
    it('no error should be added', function() {
        expect(output.error).to.equal('');
    })
    it('member should not be added as team does not exist for reconstruction', function() {
        expect(output.message).to.equal("team not exist as for the desired type");
    })

});

describe('adding member again in a existing team for construction', function() {
    addon.addTeam("team3",6,5,false);
    addon.addMember("team3","anubhav",false);
    let output = addon.addMember("team3","anubhav",false);
    it('no error should be there', function() {
        expect(output.error).to.equal('');
    })
    it('member should not be added again', function() {
        expect(output.message).to.equal("member already exist");
    })
})

describe("construction and reconstruction of shares", function() {
    const credentials = addon.createUniqueCredentials();
    const n = Math.floor((Math.random() * 99 )) + 2;
    const k = Math.floor((Math.random() * (n-1)))+ 2;
    const shares = addon.getShares(credentials,n,k);
    it('secret should be reconstructed when threshold shares are given',function() {
        let x = credentials.length * 2 * k;
        arr = []
        for(let i =0;i<x;i++) {
            arr.push(shares[i]);
        }
        const kshares = new Uint8Array(arr);
        const obj  = addon.getSecret(kshares,k);
        expect(obj.secret).to.equal(credentials);
    })
    it('secret should not be reconstructed when shares are less than threshold',function() {
        let x = credentials.length * 2 * (k-1);
        arr = []
        for(let i =0;i<x;i++) {
            arr.push(shares[i]);
        }

        const kshares = new Uint8Array(arr);
        const obj  = addon.getSecret(kshares,k-1);
        expect(obj.secret).to.not.equal(credentials);
    })
    it('secret should not be reconstructed when threshold is not given', function() {
        let x = credentials.length * 2 * k;
        arr = []
        for(let i =0;i<x;i++) {
            arr.push(shares[i]);
        }
        const kshares = new Uint8Array(arr);
        const obj  = addon.getSecret(kshares);
        expect(obj.error).to.equal("Expected 2 arguments");        
    })
})