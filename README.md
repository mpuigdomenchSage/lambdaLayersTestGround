# lambdaLayersTestGround

Do deploy this stack first the dotnet solution needs to be build , you can do that running 

> dotnet build ./LayersTesting/LayersTesting.sln--configuration RELEASE -p:PackageLambdas="true"

After that  you can run a build and deploy of the infrastructure goind to the infra directory and :

> npm run build 

> npm run deploy 

you should make sure you put the correct aws profile inside the package.json file.