package dev.gbuchenberger.aleator.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import dev.gbuchenberger.aleator.domain.nlp.Token;

public interface TokenRepository extends CrudRepository<Token, Long> {
	
	@Query(value = "SELECT word FROM token WHERE pos = :pos ORDER BY RAND() LIMIT 1", nativeQuery = true)
	String findRandomWordByPos(@Param("pos") String pos);
	
	@Query(value = "SELECT hjid FROM tokens ORDER BY RAND() LIMIT 1", nativeQuery = true)
	Long getRandomTokensId();
	
	@Query(value = "SELECT pos FROM token WHERE token_tokens_hjid = :id", nativeQuery = true)
	List<String> findPosByTokensId(@Param("id") long id);
	
	@Query(value = "SELECT * FROM token WHERE token_tokens_hjid = :id", nativeQuery = true)
	List<Token> getTokensById(@Param("id") long id);
	
	List<Token> findByPos(String pos);

}
