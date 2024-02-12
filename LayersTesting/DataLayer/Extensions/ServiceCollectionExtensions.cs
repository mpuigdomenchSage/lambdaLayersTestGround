using Amazon.DynamoDBv2;
using Microsoft.Extensions.DependencyInjection;

namespace DataLayer
{
	public static class ServiceCollectionExtensions
	{
		public static IServiceCollection AddDynamoRepository(this IServiceCollection services) => 
			services
				.AddAWSService<IAmazonDynamoDB>()
				.AddScoped<IDynamoDbRepo, DynamoDbRepo>();
	}
}
