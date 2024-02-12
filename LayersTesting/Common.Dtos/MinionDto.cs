namespace Common.Dtos
{
	public class MinionDto
	{
		public string Name { get; set; } = string.Empty;

		public Guid Id { get; set; } = Guid.NewGuid();

		public int numBananas { get; set; } = 0;
	}
}
