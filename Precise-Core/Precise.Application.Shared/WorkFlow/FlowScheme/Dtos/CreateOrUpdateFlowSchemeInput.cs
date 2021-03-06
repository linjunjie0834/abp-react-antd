using System.ComponentModel.DataAnnotations;

namespace Precise.WorkFlow.Dtos
{
    public class CreateOrUpdateFlowSchemeInput
    {
        [Required]
        public FlowSchemeEditDto FlowScheme { get; set; }
    }
}