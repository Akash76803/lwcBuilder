public with sharing class BuilderSchemaService {
    public class ObjectOption {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
        public ObjectOption(Schema.DescribeSObjectResult d) { apiName=d.getName(); label=d.getLabel(); }
    }
    public class ObjectPage {
        @AuraEnabled public List<ObjectOption> objects=new List<ObjectOption>();
        @AuraEnabled public Integer nextOffset;
    }
    public class FieldOption {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
        @AuraEnabled public String type;
        @AuraEnabled public String relationshipName;
        @AuraEnabled public Boolean editable;
        @AuraEnabled public Boolean createable;
        @AuraEnabled public Boolean required;
        @AuraEnabled public List<ObjectOption> targets=new List<ObjectOption>();
    }
    public class ChildOption {
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String label;
        @AuraEnabled public String relationshipName;
        @AuraEnabled public String foreignKey;
    }
    public class ObjectSchema {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
        @AuraEnabled public List<FieldOption> fields=new List<FieldOption>();
        @AuraEnabled public List<ChildOption> children=new List<ChildOption>();
    }
    @AuraEnabled(cacheable=true)
    public static ObjectPage listObjects(String searchTerm, Integer offset) {
        Map<String,Schema.SObjectType> types=Schema.getGlobalDescribe();
        List<String> keys=new List<String>(types.keySet());keys.sort();
        String term=String.isBlank(searchTerm)?'':searchTerm.trim().toLowerCase();
        List<String> matches=new List<String>();
        for(String key:keys) if(term=='' || key.toLowerCase().contains(term)) matches.add(key);
        Integer start=offset==null?0:offset;
        if(start<0 || start>matches.size()) throw new AuraHandledException('Invalid object page.');
        ObjectPage result=new ObjectPage();Integer endIndex=Math.min(start+100,matches.size());
        for(Integer i=start;i<endIndex;i++) {
            Schema.DescribeSObjectResult d=types.get(matches[i]).getDescribe();
            if(d.isAccessible() && d.isQueryable() && !d.isDeprecatedAndHidden()) result.objects.add(new ObjectOption(d));
        }
        result.nextOffset=endIndex<matches.size()?endIndex:null;
        return result;
    }
    @AuraEnabled(cacheable=true)
    public static ObjectSchema describeObject(String objectApiName) {
        Schema.SObjectType type=Schema.getGlobalDescribe().get(objectApiName);
        if(type==null) throw new AuraHandledException('Unknown object.');
        Schema.DescribeSObjectResult d=type.getDescribe();
        if(!d.isAccessible() || !d.isQueryable()) throw new AuraHandledException('Object is not readable or queryable.');
        ObjectSchema result=new ObjectSchema();result.apiName=d.getName();result.label=d.getLabel();
        Map<String,Schema.SObjectField> fields=d.fields.getMap();List<String> keys=new List<String>(fields.keySet());keys.sort();
        for(String key:keys) {
            Schema.DescribeFieldResult f=fields.get(key).getDescribe();
            if(!f.isAccessible() || f.isDeprecatedAndHidden()) continue;
            FieldOption option=new FieldOption();option.apiName=f.getName();option.label=f.getLabel();option.type=String.valueOf(f.getType());
            option.editable=f.isUpdateable();option.createable=f.isCreateable();option.required=!f.isNillable() && !f.isDefaultedOnCreate();
            option.relationshipName=f.getRelationshipName();
            if(f.getType()==Schema.DisplayType.Reference && option.relationshipName!=null) {
                for(Schema.SObjectType target:f.getReferenceTo()) {
                    Schema.DescribeSObjectResult td=target.getDescribe();
                    if(td.isAccessible() && td.isQueryable()) option.targets.add(new ObjectOption(td));
                }
            }
            result.fields.add(option);
        }
        Set<String> seen=new Set<String>();
        for(Schema.ChildRelationship relationship:d.getChildRelationships()) {
            String name=relationship.getRelationshipName();
            if(name==null || relationship.getField()==null || relationship.isDeprecatedAndHidden() || seen.contains(name)) continue;
            Schema.DescribeSObjectResult child=relationship.getChildSObject().getDescribe();
            Schema.DescribeFieldResult keyField=relationship.getField().getDescribe();
            if(!child.isAccessible() || !child.isQueryable() || !keyField.isAccessible()) continue;
            ChildOption option=new ChildOption();option.objectApiName=child.getName();option.label=child.getLabelPlural();option.relationshipName=name;option.foreignKey=keyField.getName();
            result.children.add(option);seen.add(name);
        }
        return result;
    }
}
