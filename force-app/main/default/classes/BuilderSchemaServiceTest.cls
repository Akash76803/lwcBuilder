@IsTest
private class BuilderSchemaServiceTest {
    @IsTest static void describesContactRelationships() {
        Test.startTest();
        BuilderSchemaService.ObjectSchema c=BuilderSchemaService.describeObject('Contact');
        BuilderSchemaService.ObjectSchema a=BuilderSchemaService.describeObject('Account');
        Test.stopTest();
        System.assertEquals('Contact',c.apiName);
        Boolean nameFound=false, accountFound=false, contactsFound=false;
        for(BuilderSchemaService.FieldOption f:c.fields) {
            if(f.apiName=='LastName') nameFound=true;
            if(f.apiName=='AccountId') {accountFound=true;System.assertEquals('Account',f.relationshipName);System.assert(!f.targets.isEmpty());}
        }
        for(BuilderSchemaService.ChildOption r:a.children) if(r.relationshipName=='Contacts') {contactsFound=true;System.assertEquals('AccountId',r.foreignKey);}
        System.assert(nameFound);System.assert(accountFound);System.assert(contactsFound);
    }
    @IsTest static void objectSearchAndInvalidInput() {
        BuilderSchemaService.ObjectPage page=BuilderSchemaService.listObjects('Contact',0);
        Boolean found=false;for(BuilderSchemaService.ObjectOption o:page.objects) if(o.apiName=='Contact') found=true;
        System.assert(found);
        try {BuilderSchemaService.describeObject('NotAnObject__c');System.assert(false,'Must reject unknown object');} catch(AuraHandledException e) {}
        try {BuilderSchemaService.listObjects('',-1);System.assert(false,'Must reject negative cursor');} catch(AuraHandledException e) {}
    }
}
