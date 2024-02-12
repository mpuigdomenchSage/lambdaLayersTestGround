using Common.Dtos;
using DataLayer;

var builder = WebApplication.CreateBuilder(args);


// Add AWS Lambda support. When application is run in Lambda Kestrel is swapped out as the web server with Amazon.Lambda.AspNetCoreServer. This
// package will act as the webserver translating request and responses between the Lambda event source and ASP.NET Core.
builder.Services
	.AddDynamoRepository()
	.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();


app.UseHttpsRedirection();
app.MapPost("api/v1.0/noLayers",
	 async (HttpContext httpContext, IDynamoDbRepo dynamoDbRepo, MinionDto minion, ILogger<Program> logger) =>
	 {
		 logger.LogInformation("Starting the Post Attachments enpoint");
		 var result = await dynamoDbRepo.Add(minion); 
		 return Results.Created("api/v1.0/noLayers", minion);
	 })
	.Produces(StatusCodes.Status201Created)
	.ProducesValidationProblem()
	.ProducesProblem(StatusCodes.Status401Unauthorized)
	.Produces(StatusCodes.Status429TooManyRequests)
	.Produces(StatusCodes.Status500InternalServerError);
app.Run();
