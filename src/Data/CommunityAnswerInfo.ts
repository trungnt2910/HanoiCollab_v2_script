class CommunityAnswerInfoWritten extends Array<{User: string, Answer: string}>
{

}

class CommunityAnswerInfoMultipleChoiceAnswer extends Array<string>
{
    Alpha: string = "";
}

class CommunityAnswerInfoMultipleChoice
{
    MultipleChoice: IDictionary<CommunityAnswerInfoMultipleChoiceAnswer> = {};
}

type CommunityAnswerInfo = CommunityAnswerInfoWritten & CommunityAnswerInfoMultipleChoice;

export { CommunityAnswerInfo, CommunityAnswerInfoWritten, CommunityAnswerInfoMultipleChoiceAnswer };