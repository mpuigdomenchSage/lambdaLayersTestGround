using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using Common.Dtos;
using System.Net;

namespace DataLayer
{
	public class DynamoDbRepo : IDynamoDbRepo
	{
		private readonly IAmazonDynamoDB amazonDynamoDB;
        
		public DynamoDbRepo(IAmazonDynamoDB amazonDynamoDB)
        {
			this.amazonDynamoDB = amazonDynamoDB;
        }

		public async Task<bool> Add(MinionDto item)
		{
			var request = new PutItemRequest
			{
				TableName = "minionsTesting",
				ReturnConsumedCapacity = "TOTAL",
				Item = new Dictionary<string, AttributeValue>
					{
						{ "pk", new AttributeValue { S = "OWNER#test" } },
						{ "sk", new AttributeValue { S = $"MINION#{item.Id}" } },
						
						{ "name", new AttributeValue { S =item.Name } },
						{ "numBananas", new AttributeValue { N = item.numBananas.ToString() } },
						{ "Created", new AttributeValue { S = DateTime.UtcNow.ToString("o") } },
						{ "CreatedBy", new AttributeValue { S = "test" } },
					}
			};
			var result = await amazonDynamoDB.PutItemAsync(request);
			return result.HttpStatusCode == HttpStatusCode.OK;
		}

    }

	public interface IDynamoDbRepo
	{
		Task<bool> Add(MinionDto item);
	}	
}
